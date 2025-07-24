import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons  } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function MenuScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = Math.min(width * 0.92, 400);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Menu</ThemedText>

      <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} onPress={() => router.push('/(tabs)/menu/householdinformation')}>
        <View style={styles.buttonContent}>
          <Ionicons name="home-outline" size={24} color="#1e293b" />
          <ThemedText style={styles.buttonText}>Household Information</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} onPress={() => router.push('/(tabs)/menu/transactionhistory')}>
        <View style={styles.buttonContent}>
          <Ionicons name="receipt-outline" size={24} color="#1e293b" />
          <ThemedText style={styles.buttonText}>Transaction History</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} onPress={() => router.push('/(tabs)/menu/healthrecords')}>
        <View style={styles.buttonContent}>
          <Ionicons name="medkit-outline" size={22} color="#1e293b" />
          <ThemedText style={styles.buttonText}>Health Records</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} onPress={() => router.push('/(tabs)/menu/businessinfo')}>
        <View style={styles.buttonContent}>
          <Ionicons name="storefront-outline" size={24} color="#1e293b" />
          <ThemedText style={styles.buttonText}>Business Info</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { width: BUTTON_WIDTH }]} onPress={() => router.push('/(tabs)/menu/cncrequest')}>
        <View style={styles.buttonContent}>
          <Ionicons name="documents-outline" size={24} color="#1e293b" />
          <ThemedText style={styles.buttonText}>Certificate & Clearance Request</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    marginBottom: 28,
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 18,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
    flexShrink: 1,
  },
});