import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config.ts';


const API_BASE_URL = API_URL;

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  };
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Salva o token e informações do usuário no AsyncStorage
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(data.user));

   // console.log(data.token);

    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const validateAuthToken = async (): Promise<boolean> => {
  try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;
      
      // Verifica se o token está expirado
      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });

      //console.log(response);
      
      return response.ok;
  } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
  }
};

// Atualize a função checkAuthToken para usar a validação
export const checkAuthToken = async (): Promise<boolean> => {
  return await validateAuthToken();
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Remove os dados do usuário do AsyncStorage
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};