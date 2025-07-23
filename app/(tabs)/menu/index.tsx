import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';



export default function MenuScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Menu</Text>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu/householdinformation')}>
                    <Text>Household Information</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu/transactionhistory')}>
                    <Text>Transaction History</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu/healthrecords')}>
                    <Text>Health Records</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu/businessinfo')}>
                    <Text>Business Info</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/menu/cncrequest')}>
                    <Text>Certificate and Clearance Request</Text>
                </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#eee',
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        width: 200,
        alignItems: 'center',
    },
});
