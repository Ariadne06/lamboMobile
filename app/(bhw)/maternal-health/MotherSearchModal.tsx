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
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

//  FIX: Update interface to match API response
interface MotherResult {
  maternal_id: number; 
  full_name: string;
  dob: string;
  age_years: number; 
  family_code?: string;
  complete_address?: string;
  phone_number?: string;
  nhts_status: boolean; 
}

interface MotherSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mother: MotherResult) => void;
}

export default function MotherSearchModal({ visible, onClose, onSelect }: MotherSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MotherResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchMother = async () => {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      setError('Please enter at least 2 characters');
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_SEARCH_MOTHER}?q=${encodeURIComponent(trimmedQuery)}`
      );
      const data = await res.json();

      console.log('🔍 Mother search response:', data); // Debug log

      if (data.success) {
        // ✅ FIX: Filter out any invalid items using maternal_id
        const validResults = (data.data || []).filter((item: any) => 
          item && typeof item.maternal_id === 'number'
        );
        
        setResults(validResults);
        
        if (validResults.length === 0) {
          setError(`No eligible mothers found matching "${trimmedQuery}"`);
        }
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      console.error('Mother search error:', err);
      setError('Network error. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setError('');
    }
  };

  const handleSelect = (mother: MotherResult) => {
    console.log('✅ Selected mother:', mother); // Debug log
    onSelect(mother);
    onClose();
    setQuery('');
    setResults([]);
    setError('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="pregnant-woman" size={22} color="#EC4899" />
            <Text style={styles.title}>Search Mother</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by name, family code, ID..."
              value={query}
              onChangeText={handleQueryChange}
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={searchMother}
            />
            <TouchableOpacity 
              onPress={searchMother} 
              style={[
                styles.searchButton,
                query.trim().length < 2 && styles.searchButtonDisabled
              ]}
              disabled={query.trim().length < 2}
            >
              <Ionicons name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.helperText}>
              Search for female residents (WRA: 15-49 years old)
            </Text>
          </View>

          {/* Results List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4899" />
              <Text style={styles.loadingText}>Searching mothers...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item, index) => 
                item?.maternal_id?.toString() || `mother-${index}`
              }
              style={styles.resultsList}
              renderItem={({ item }) => {
                if (!item || !item.maternal_id) {
                  return null;
                }

                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={styles.resultItem}
                  >
                    <View style={styles.avatar}>
                      <MaterialIcons name="pregnant-woman" size={20} color="#EC4899" />
                    </View>

                    <View style={styles.resultInfo}>
                      <Text style={styles.motherName}>{item.full_name}</Text>
                      <Text style={styles.motherAge}>
                        {item.age_years} years old • DOB: {item.dob}
                      </Text>
                      
                      {item.family_code && (
                        <Text style={styles.familyText}>Family: {item.family_code}</Text>
                      )}

                      {item.complete_address && (
                        <Text style={styles.addressText} numberOfLines={1}>
                          📍 {item.complete_address}
                        </Text>
                      )}
                      
                      {item.phone_number && (
                        <Text style={styles.phoneText}>📱 {item.phone_number}</Text>
                      )}

                      {item.nhts_status && (
                        <Text style={styles.nhtsText}>✓ NHTS Beneficiary</Text>
                      )}
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              }}
              // ✅ FIX: Remove ListEmptyComponent to fix weird line
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="pregnant-woman" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Find a Mother</Text>
              <Text style={styles.emptySubtext}>
                Type at least 2 characters to search for eligible mothers
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  searchButton: {
    backgroundColor: '#EC4899',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultsList: {
    maxHeight: 400,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  motherName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  motherAge: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  familyText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  addressText: {
    fontSize: 11,
    color: '#6B7280',
  },
  phoneText: {
    fontSize: 11,
    color: '#10B981',
  },
  nhtsText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
});