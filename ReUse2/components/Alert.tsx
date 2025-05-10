// components/Alert.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

type AlertType = 'success' | 'error' | 'warning';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, type, title, message, onClose }) => {
  const getAlertColor = () => {
    switch(type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FFC107';
      default: return '#F44336';
    }
  };

  const getEmoji = () => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '❌';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { borderColor: getAlertColor() }]}>
            <View style={[styles.modalHeader, { backgroundColor: getAlertColor() }]}>
              <Text style={styles.modalHeaderEmoji}>{getEmoji()}</Text>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: getAlertColor() }]}
              onPress={onClose}
            >
              <Text style={[styles.actionButtonText, { color: getAlertColor() }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 15,
    alignItems: 'center',
  },
  modalHeaderEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  actionButton: {
    padding: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});

export default CustomAlert;