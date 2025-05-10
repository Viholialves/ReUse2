import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config.ts';


const API_BASE_URL = API_URL;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  profilePicture: string;
}

interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
  };
  token: string;
}

export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    // Criar FormData para enviar a imagem
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    if (data.profilePicture) {
      formData.append('profilePicture', {
        uri: data.profilePicture,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg'
      });
    }

    console.log('Enviando dados:', {
      name: data.name,
      email: data.email,
      hasImage: !!data.profilePicture
    });

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Erro ao registrar usuário');
    }

    // Salva o token e informações do usuário no AsyncStorage
    await AsyncStorage.setItem('userToken', responseData.token);
    await AsyncStorage.setItem('userData', JSON.stringify(responseData.user));

    return responseData;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

// Funções de validação
export const validateName = (name: string): boolean => {
  return name.length >= 3;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};