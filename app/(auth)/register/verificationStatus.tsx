import React from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationStatus() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const isVerified = params.isVerified === 'true';
  const message = params.message as string || 'Checking verification status...';

  const handleContinue = () => {
    if (isVerified) {
      // Go to main app
      router.replace('/(tabs)/menu');
    } else {
      // Go back to login
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ 
        flex: 1, 
        padding: 24, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        
        {/* Status Icon */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isVerified ? '#dcfce7' : '#fef3c7',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32
        }}>
          <Ionicons 
            name={isVerified ? "checkmark-circle" : "time-outline"} 
            size={80} 
            color={isVerified ? "#10b981" : "#f59e0b"} 
          />
        </View>

        {/* Title */}
        <ThemedText style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: 16,
          textAlign: 'center',
          padding: 10
          
        }}>
          {isVerified ? ' Account Verified!' : ' Verification Pending'}
        </ThemedText>

        {/* Message */}
        <ThemedText style={{
          fontSize: 16,
          color: '#64748b',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 40,
          paddingHorizontal: 20
        }}>
          {message}
        </ThemedText>

        {/* Info Card */}
        <View style={{
          backgroundColor: isVerified ? '#dcfce7' : '#fef3c7',
          padding: 20,
          borderRadius: 12,
          marginBottom: 40,
          width: '100%',
          borderLeftWidth: 4,
          borderLeftColor: isVerified ? '#10b981' : '#f59e0b'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={isVerified ? "shield-checkmark-outline" : "document-text-outline"} 
              size={24} 
              color={isVerified ? "#10b981" : "#f59e0b"} 
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: isVerified ? '#10b981' : '#f59e0b',
                marginBottom: 4
              }}>
                {isVerified ? 'Full Access Granted' : 'Manual Review Required'}
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: isVerified ? '#065f46' : '#92400e',
                lineHeight: 20
              }}>
                {isVerified 
                  ? 'You can now access all features of the system.'
                  : 'Supporting documents require manual verification. Expected wait time: 1-3 business days.'
                }
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={{
            backgroundColor: isVerified ? '#10b981' : '#FF3D33',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            width: '100%'
          }}
          onPress={handleContinue}
        >
          <ThemedText style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600'
            
          }}>
            {isVerified ? 'Continue to App' : 'Back to Login'}
          </ThemedText>
        </TouchableOpacity>

        {/* Pro Tip */}
        {/* {!isVerified && (
          <View style={{
            backgroundColor: '#e0f2fe',
            padding: 16,
            borderRadius: 12,
            marginTop: 20,
            width: '100%'
          }}>
            <ThemedText style={{
              fontSize: 14,
              color: '#0369a1',
              textAlign: 'center',
              lineHeight: 20
            }}>
               Pro tip: Use government-issued ID documents for instant verification next time!
            </ThemedText>
          </View>
        )} */}

      </ScrollView>
    </SafeAreaView>
  );
}