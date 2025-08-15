import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

// Define document sub-options with identity_doc_type_id
const GUARDIAN_DOCUMENT_OPTIONS = {
  GUARDIAN_ID: {
    title: "Guardian's ID Documents",
    description: "Use your guardian's government-issued ID documents",
    color: '#3b82f6',
    documents: [
      { 
        label: 'Philippine National ID', 
        value: 'Philippine National ID',
        identity_doc_type_id: 1  
      },
      { 
        label: "Driver's License", 
        value: 'Drivers License',
        identity_doc_type_id: 4  
      },
      { 
        label: "Voter's ID", 
        value: 'Voters ID',
        identity_doc_type_id: 2 
      },
      { 
        label: 'UMID', 
        value: 'UMID',
        identity_doc_type_id: 3 
      },
    ]
  },
  GUARDIAN_SUPPORTING: {
    title: "Guardian's Supporting Documents",
    description: "Use your guardian's supporting documents",
    color: '#10b981',
    documents: [
      { 
        label: 'Birth Certificate', 
        value: 'Birth Certificate',
        identity_doc_type_id: 5  
      },
      { 
        label: "Voter's Certificate", 
        value: 'Voters Certificate',
        identity_doc_type_id: 6  
      },
    ]
  }
};

export default function GuardianDocumentType() {
  const router = useRouter();
  const { setFormData } = useRegister();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const handleDocumentSelect = (document: any, guardianType: string) => {
    // Update form data with specific guardian document details
    setFormData((prev: any) => ({
      ...prev,
      guardian_type: guardianType,
      verification_type: 'GUARDIAN',
      document_type: document.value,
      identity_doc_type_id: document.identity_doc_type_id,
    }));

    console.log('Guardian document selected:', document.value);
    console.log('Guardian type:', guardianType);
    console.log('Identity doc type ID:', document.identity_doc_type_id);
    
    // Navigate to upload document screen
    router.push('/(auth)/register/uploadDocument');
  };

  const goBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      router.back();
    }
  };

  const getCurrentTitle = () => {
    if (selectedCategory) {
      return GUARDIAN_DOCUMENT_OPTIONS[selectedCategory as keyof typeof GUARDIAN_DOCUMENT_OPTIONS].title;
    }
    return 'Choose Guardian Document Type';
  };

  const getCurrentSubtitle = () => {
    if (selectedCategory) {
      return 'Select the specific document you want to upload';
    }
    return 'Choose the type of guardian document for verification';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Title and Description */}
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ff6b35" />
          </View>
          <ThemedText style={styles.title}>{getCurrentTitle()}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {getCurrentSubtitle()}
          </ThemedText>
        </View>

        {/* Category Selection */}
        {!selectedCategory && (
          <View style={styles.optionsContainer}>
            {Object.entries(GUARDIAN_DOCUMENT_OPTIONS).map(([key, option]) => (
              <TouchableOpacity
                key={key}
                style={[styles.optionCard, { borderLeftColor: option.color }]}
                onPress={() => handleCategorySelect(key)}
                activeOpacity={0.85}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}15` }]}>
                    <Ionicons 
                      name={key === 'GUARDIAN_ID' ? 'card-outline' : 'document-outline'} 
                      size={28} 
                      color={option.color} 
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                    <View style={styles.featureList}>
                      {key === 'GUARDIAN_ID' ? (
                        <>
                          <Text style={styles.featureItem}>• Automatic verification with OCR</Text>
                          <Text style={styles.featureItem}>• Faster processing</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.featureItem}>• Manual review required</Text>
                          <Text style={styles.featureItem}>• Additional verification time</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Document Sub-Selection */}
        {selectedCategory && (
          <View style={styles.documentsContainer}>
            {GUARDIAN_DOCUMENT_OPTIONS[selectedCategory as keyof typeof GUARDIAN_DOCUMENT_OPTIONS].documents.map((doc) => (
              <TouchableOpacity
                key={doc.value}
                style={styles.documentCard}
                onPress={() => handleDocumentSelect(doc, selectedCategory)}
                activeOpacity={0.85}
              >
                <View style={styles.documentContent}>
                  <View style={styles.documentIconContainer}>
                    <Ionicons 
                      name={selectedCategory === 'GUARDIAN_ID' ? 'card-outline' : 'document-outline'} 
                      size={24} 
                      color="#6b7280" 
                    />
                  </View>
                  <View style={styles.documentTextContainer}>
                    <ThemedText style={styles.documentText}>{doc.label}</ThemedText>
                    <ThemedText style={styles.documentSubtext}>
                      {selectedCategory === 'GUARDIAN_ID' ? 'Will be scanned automatically' : 'Manual review required'}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#ff6b35" />
          <Text style={styles.infoText}>
            {selectedCategory === 'GUARDIAN_ID' 
              ? 'Guardian ID documents will be automatically scanned and compared with your guardian\'s registered information.'
              : selectedCategory === 'GUARDIAN_SUPPORTING'
              ? 'Guardian supporting documents will be manually reviewed by our team for verification.'
              : 'You will upload your guardian\'s documents for verification. Your guardian\'s account must be verified for this process to work.'
            }
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  featureList: {
    marginTop: 4,
  },
  featureItem: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  documentsContainer: {
    marginBottom: 30,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentTextContainer: {
    flex: 1,
  },
  documentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  documentSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#c2410c',
    marginLeft: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
});