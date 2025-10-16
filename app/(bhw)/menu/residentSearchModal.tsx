import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/apiConfig';

type ResidentResult = {
  resident_id: number;
  resident_code: string;
  full_name: string;
  dob: string;
  sex: string;
  is_verified: boolean;
  resident_status: string;
};

type ResidentSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (resident: ResidentResult) => void;
};

export default function ResidentSearchModal({ visible, onClose, onSelect }: ResidentSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResidentResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchResident = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/household_api/search-resident/?q=${encodeURIComponent(query)}&only_verified=true&limit=20`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.15)' }}
      >
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          padding: 18,
          width: '90%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MaterialIcons name="person-search" size={22} color="#0ea5e9" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#0ea5e9' }}>
              Search Resident
            </Text>
          </View>
          <TextInput
            placeholder="Search by name or code"
            value={query}
            onChangeText={setQuery}
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              fontSize: 15,
              backgroundColor: '#f9fafb',
            }}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={searchResident}
          />
          <TouchableOpacity
            onPress={searchResident}
            style={{
              marginBottom: 12,
              backgroundColor: '#0ea5e9',
              padding: 10,
              borderRadius: 6,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color="#0ea5e9" style={{ marginVertical: 16 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.resident_id.toString()}
              style={{ maxHeight: 260 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>
                  {query ? 'No residents found.' : 'Type to search for a resident.'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                    paddingHorizontal: 2,
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#334155', fontSize: 15 }}>
                    {item.full_name} <Text style={{ color: '#0ea5e9' }}>({item.resident_code})</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {item.resident_status} | {item.sex} | DOB: {item.dob}
                  </Text>
                  {item.is_verified && (
                    <Text style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>
                      <Ionicons name="checkmark-circle" size={12} color="#22c55e" /> Verified
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 18,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}