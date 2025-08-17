import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResidents = async () => {
      const { data, error } = await supabase.from('resident').select('*');

      if (error) {
        console.error('Error fetching residents:', error.message);
      } else {
        setResidents(data || []);
      }

      setLoading(false);
    };

    fetchResidents();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
      }}
    >

<View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <Link href="/residents" asChild>
          <Pressable
            style={{
              backgroundColor: '#1e40af',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Go to Residents
            </Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/login" asChild>
          <Pressable
            style={{
              backgroundColor: '#dc2626',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
          </Pressable>
        </Link>
      </View>

        <Link href="/(nurse)" asChild>
          <Pressable
            style={{
              backgroundColor: '#16a34a',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Nurse Dashboard
            </Text>
          </Pressable>
        </Link>
      
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Resident List
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderColor: '#ccc',
                width: '100%',
              }}
            >
              <Text>
                {item.first_name} {item.last_name}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
  
}

