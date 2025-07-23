import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default function HealthRecordsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Health Records</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        padding: 20,
        backgroundColor: '#FF3D33',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    }
})