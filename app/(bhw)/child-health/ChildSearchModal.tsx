import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

type ChildResult = {
  child_resident_id: number;
  child_full_name: string;
  dob: string;
  sex: string;
  family_code?: string;
  mother_full_name?: string;
  father_full_name?: string;
  guardian_full_name?: string;
  complete_address?: string;
  philhealth_no?: string;
  phone_number?: string;
};

// Extended type with mapped properties
type ExtendedChildResult = ChildResult & {
  resident_id: number;
  full_name: string;
  resident_code: string;
};

type ChildSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (child: ExtendedChildResult) => void;
};

export default function ChildSearchModal({ visible, onClose, onSelect }: ChildSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChildResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchChild = async () => {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      setError('Please enter at least 2 characters');
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_HEALTH_SEARCH}?q=${encodeURIComponent(trimmedQuery)}`
      );
      const data = await res.json();

      if (data.success) {
        setResults(data.data || []);
        if (data.count === 0) {
          setError(`No children found matching "${trimmedQuery}"`);
        }
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      console.error('Child search error:', err);
      setError('Network error. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setError('');
    }
  };

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} old`;
    } else if (years < 2) {
      return `${years}y ${months}m old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  };

  const handleSelect = (child: ChildResult) => {
    // Map ChildResult to ExtendedChildResult
    const mappedChild: ExtendedChildResult = {
      ...child,
      resident_id: child.child_resident_id,
      full_name: child.child_full_name,
      resident_code: `R${child.child_resident_id.toString().padStart(5, '0')}`,
    };
    
    onSelect(mappedChild);
    onClose();
    setQuery('');
    setResults([]);
    setError('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="child-care" size={22} color="#2563EB" />
            <Text style={styles.title}>Search Child</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by name, family code, ID..."
              value={query}
              onChangeText={handleQueryChange}
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={searchChild}
            />
            <TouchableOpacity 
              onPress={searchChild} 
              style={[
                styles.searchButton,
                query.trim().length < 2 && styles.searchButtonDisabled
              ]}
              disabled={query.trim().length < 2}
            >
              <Ionicons name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.helperText}>
              Enter at least 2 characters to search
            </Text>
          </View>

          {/* Results List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Searching children...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={item => item.child_resident_id.toString()}
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={styles.resultItem}
                >
                  <View style={[
                    styles.avatar,
                    { backgroundColor: item.sex === 'Male' ? '#DBEAFE' : '#FCE7F3' }
                  ]}>
                    <MaterialIcons
                      name="child-care"
                      size={20}
                      color={item.sex === 'Male' ? '#3B82F6' : '#EC4899'}
                    />
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={styles.childName}>
                      {item.child_full_name}
                      <Text style={styles.childCode}>
                        {' '}(R{item.child_resident_id.toString().padStart(5, '0')})
                      </Text>
                    </Text>
                    
                    <View style={styles.childMeta}>
                      <View style={[
                        styles.sexBadge,
                        { backgroundColor: item.sex === 'Male' ? '#DBEAFE' : '#FCE7F3' }
                      ]}>
                        <Ionicons
                          name={item.sex === 'Male' ? 'male' : 'female'}
                          size={10}
                          color={item.sex === 'Male' ? '#3B82F6' : '#EC4899'}
                        />
                        <Text style={[
                          styles.sexText,
                          { color: item.sex === 'Male' ? '#3B82F6' : '#EC4899' }
                        ]}>
                          {item.sex}
                        </Text>
                      </View>
                      <Text style={styles.ageText}>{calculateAge(item.dob)}</Text>
                    </View>

                    {item.mother_full_name && (
                      <Text style={styles.parentText}>
                        Mother: {item.mother_full_name}
                      </Text>
                    )}
                    
                    {item.family_code && (
                      <Text style={styles.familyText}>
                        Family: {item.family_code}
                      </Text>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="child-care" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                Type to search for a child
              </Text>
              <Text style={styles.emptySubtext}>
                Search by name, family code, or resident ID
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultsList: {
    maxHeight: 400,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  childCode: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  sexText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  parentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  familyText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});