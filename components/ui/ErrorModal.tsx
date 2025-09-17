import React from 'react';
import {  Modal,  View,  Text,  TouchableOpacity,  StyleSheet, Animated,  Dimensions,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface ErrorAction {
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  actions: ErrorAction[];
  onClose?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title,
  message,
  icon = 'alert-circle',
  iconColor = '#ef4444',
  actions,
  onClose,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modal, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          {/* Icon Section */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  action.style === 'primary' && styles.primaryButton,
                  action.style === 'secondary' && styles.secondaryButton,
                  action.style === 'danger' && styles.dangerButton,
                ]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.actionText,
                  action.style === 'primary' && styles.primaryText,
                  action.style === 'danger' && styles.dangerText,
                ]}>
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 0,
    width: Math.min(width - 40, 400),
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  primaryButton: {
    backgroundColor: '#FF3D33',
    borderColor: '#FF3D33',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  primaryText: {
    color: '#fff',
  },
  dangerText: {
    color: '#dc2626',
  },
});