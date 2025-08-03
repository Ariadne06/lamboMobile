import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const transactions = [
    { id: 1, date: '2025-07-25', transaction: 'Cedula', amount: 150 },
    { id: 2, date: '2025-07-20', transaction: 'Barangay Clearance', amount: 300 },
    { id: 3, date: '2025-07-15', transaction: 'Barangay Clearance', amount: 300 },
];

export default function TransactionHistoryScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.tableHeader}>
                <ThemedText type="defaultSemiBold" style={[styles.tableHeaderText, styles.cell, { flex: 2 }]}>Date</ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.tableHeaderText, styles.cell, { flex: 3 }]}>Transaction</ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.tableHeaderText, styles.cell, { flex: 2 }]}>Amount</ThemedText>
            </View>
            {transactions.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                    <ThemedText style={[styles.tableCell, styles.cell, { flex: 2 }]}>{item.date}</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.cell, { flex: 3 }]}>{item.transaction}</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.cell, { flex: 2 }]}>₱{item.amount.toFixed(2)}</ThemedText>
                </View>
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 8,
    },
    header: {
        paddingTop: 32,
        paddingBottom: 16,
        backgroundColor: '#FF3D33',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFA333',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 6,
        alignItems: 'center',
        borderRadius: 8,
        shadowColor: '#000',
    },
    tableHeaderText: {
        
        color: '#374151',
        fontSize: 16,
        textAlign: 'center',
        
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 6,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    tableCell: {
        fontSize: 15,
        color: '#374151',
        textAlign: 'center',
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});