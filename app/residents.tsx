
import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';


type Resident = {
  resident_id: number;
  first_name: string;
  last_name: string;
 
};

export default function ResidentsScreen() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.15:8000/api/residents/') // Replace with your actual IP
      .then((res) => res.json())
      .then((data) => {
       
        setResidents(data.results || data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching residents:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-500">Loading residents...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Residents List</Text>
      <FlatList
        data={residents}
        keyExtractor={(item) => item?.resident_id?.toString()}
        renderItem={({ item }) => (
          <View className="mb-3">
            <Text className="text-lg">
              {item?.first_name} {item?.last_name}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
