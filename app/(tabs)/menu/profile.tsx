import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container}>
            
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