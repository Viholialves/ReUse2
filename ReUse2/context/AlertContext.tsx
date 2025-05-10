// context/AlertContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import CustomAlert from '../components/Alert';

type AlertType = 'success' | 'error' | 'warning';

interface AlertContextData {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: AlertType;
    title: string;
    message: string;
  }>({ type: 'error', title: '', message: '' });

  const showAlert = useCallback((type: AlertType, title: string, message: string) => {
    setAlertData({ type, title, message });
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert
        visible={visible}
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);