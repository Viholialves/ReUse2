import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = API_URL;

interface Product {
  id: number;
  user_id: number;
  fotos: string[];
  nome: string;
  tags: string[];
  descricao: string;
  estado: string;
  valor: number;
  city: string;
  state: string;
  status: number;
}

interface ApiResponse {
  success: boolean;
  produtos?: Product[];
  message?: string;
  error?: string;
}


export const getProducts = async (): Promise<Product[]> => {
    
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/prod/`, {
      method: 'GET', // Alterado para GET pois é uma operação de leitura
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });



    const data: ApiResponse = await response.json();

    //console.log(data.produtos);

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Erro ao buscar produtos');
    }

    if (!data.produtos) {
      throw new Error('Nenhum produto encontrado');
    }

    // Se as fotos e tags vierem como string JSON, podemos parsear aqui
    return data.produtos.map(prod => ({
      ...prod,
      fotos: typeof prod.fotos === 'string' ? JSON.parse(prod.fotos) : prod.fotos,
      tags: typeof prod.tags === 'string' ? JSON.parse(prod.tags) : prod.tags,
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Ocorreu um erro desconhecido ao buscar produtos'
    );
  }
};