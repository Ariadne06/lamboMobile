import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

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
