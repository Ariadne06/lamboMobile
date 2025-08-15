import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

// Define interfaces for type safety
interface Document {
  label: string;
  value: string;
  identity_doc_type_id: number;
}

interface DocumentCategory {
  title: string;
  subtitle: string;
  verification_type: string;
  icon: string;
  color: string;
  documents: Document[];
}

// Document categories with identity_doc_type_id mapping
const DOCUMENT_CATEGORIES: Record<string, DocumentCategory> = {
  ID: {
    title: 'ID Documents',
    subtitle: 'Government-issued identification cards',
    verification_type: 'ID',
    icon: 'card-outline',
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
  DOCUMENT: {
    title: 'Supporting Documents',
    subtitle: 'Birth certificates and other supporting documents',
    verification_type: 'SUPPORTING',
    icon: 'document-text-outline',
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
  },
  GUARDIAN_DOCUMENT: {
    title: 'Guardian Documents',
    subtitle: 'Register using guardian verification',
    verification_type: 'GUARDIAN',
    icon: 'person-outline',
    color: '#FF3D33',
    documents: [] // Empty for guardian - handled separately
  }
};

export default function ChooseDocument() {
  const router = useRouter();
  const { setFormData } = useRegister();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const handleGuardianDocumentSelect = () => {
    // Set basic guardian verification type first
    setFormData((prev: any) => ({
      ...prev,
      verification_type: 'GUARDIAN',
    }));
    
    // Go to guardian username validation FIRST
    router.push('/(auth)/register/guardianUsername');
  };

  const handleRegularDocumentSelect = (doc: Document, verification_type: string) => {
    console.log('Document selected:', doc.value);
    console.log('Verification type:', verification_type);
    console.log('Identity doc type ID:', doc.identity_doc_type_id);
    
    setFormData((prev: any) => ({
      ...prev,
      document_type: doc.value,
      verification_type: verification_type,
      identity_doc_type_id: doc.identity_doc_type_id,
      guardian_type: null,
    }));
    
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
      return DOCUMENT_CATEGORIES[selectedCategory].title;
    } else {
      return 'Choose Document Type';
    }
  };

  const getCurrentSubtitle = () => {
    if (selectedCategory) {
      return 'Choose the specific document you want to upload';
    } else {
      return 'Select the type of document you want to upload';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/id-card.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Dynamic Title */}
        <ThemedText style={styles.title}>{getCurrentTitle()}</ThemedText>
        <ThemedText style={styles.subtitle}>{getCurrentSubtitle()}</ThemedText>

        {/* Category Selection */}
        {!selectedCategory && (
          <View style={styles.categoriesContainer}>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
              <TouchableOpacity
                key={key}
                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                onPress={() => handleCategorySelect(key)}
                activeOpacity={0.85}
              >
                <View style={styles.categoryContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
                    <Ionicons name={category.icon as any} size={28} color={category.color} />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                    <ThemedText style={styles.categorySubtitle}>{category.subtitle}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Guardian Document Selection - Modified */}
        {selectedCategory === 'GUARDIAN_DOCUMENT' && (
          <View style={styles.documentsContainer}>
            <TouchableOpacity
              style={styles.documentCard}
              onPress={handleGuardianDocumentSelect}
              activeOpacity={0.85}
            >
              <View style={styles.documentContent}>
                <View style={styles.documentIconContainer}>
                  <Ionicons name="people-outline" size={24} color="#FF3D33" />
                </View>
                <View style={styles.documentTextContainer}>
                  <ThemedText style={styles.documentText}>Guardian Documents</ThemedText>
                  <ThemedText style={styles.documentSubtext}>Validate guardian first, then choose document type</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Regular Document Selection */}
        {selectedCategory && selectedCategory !== 'GUARDIAN_DOCUMENT' && (
          <View style={styles.documentsContainer}>
            {DOCUMENT_CATEGORIES[selectedCategory].documents.map((doc) => (
              <TouchableOpacity
                key={doc.value}
                style={styles.documentCard}
                onPress={() => handleRegularDocumentSelect(
                  doc, 
                  DOCUMENT_CATEGORIES[selectedCategory].verification_type
                )}
                activeOpacity={0.85}
              >
                <View style={styles.documentContent}>
                  <View style={styles.documentIconContainer}>
                    <Ionicons 
                      name={selectedCategory === 'ID' ? 'card-outline' : 'document-outline'} 
                      size={24} 
                      color="#6b7280" 
                    />
                  </View>
                  <ThemedText style={styles.documentText}>{doc.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Note */}
        {selectedCategory && (
          <View style={[styles.infoNote, { backgroundColor: `${DOCUMENT_CATEGORIES[selectedCategory].color}15` }]}>
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={DOCUMENT_CATEGORIES[selectedCategory].color} 
            />
            <ThemedText style={[styles.infoText, { color: DOCUMENT_CATEGORIES[selectedCategory].color }]}>
              {selectedCategory === 'ID' 
                ? 'ID documents are used for identity verification'
                : selectedCategory === 'GUARDIAN_DOCUMENT'
                ? 'Guardian documents require guardian username validation before upload'
                : 'Documents are used for identity verification but must be manually reviewed and approved by the system administrator.'
              }
            </ThemedText>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 80,
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
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  categoriesContainer: {
    width: '100%',
  },
  categoryCard: {
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
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  documentsContainer: {
    width: '100%',
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
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    lineHeight: 20,
  },
});