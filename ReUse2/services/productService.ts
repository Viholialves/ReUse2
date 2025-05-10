// services/productService.ts
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CreateProductParams {
  user_id: number;
  fotos: string[]; // Array de URIs das imagens
  nome: string;
  tags: string[];
  descricao: string;
  estado: string;
  valor: number;
  city: string;
  state: string;
}

export interface Product {
    id: number;
    user_id: number;
    fotos: (string | { url: string })[];
    nome: string;
    tags: string[];
    descricao: string;
    estado: string;
    valor: number;
    city: string;
    state: string;
    status: number;
    avaliacao?: number;
}


interface ApiResponse {
  success: boolean;
  produto?: any;
  produtos?: any;
  message?: string;
  error?: string;
}


export const getProductById = async (id: number): Promise<Product> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/prod/prod/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data: ApiResponse = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao buscar produto');
      }
  
      if (!data.produto) {
        throw new Error('Produto não encontrado');
      }

      //console.log(data.produto.fotos);
  
      return {
        ...data.produto,
        fotos: typeof data.produto.fotos === 'string' ? JSON.parse(data.produto.fotos) : data.produto.fotos,
        tags: typeof data.produto.tags === 'string' ? JSON.parse(data.produto.tags) : data.produto.tags,
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  };
  
  export const getUserProducts = async (userId: number): Promise<Product[]> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/prod/prod/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data: ApiResponse = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao buscar produtos do usuário');
      }
  
      if (!data.produtos) {
        return [];
      }
  
      return data.produtos.map((prod: Product) => ({
        ...prod,
        fotos: typeof prod.fotos === 'string' ? JSON.parse(prod.fotos) : prod.fotos,
        tags: typeof prod.tags === 'string' ? JSON.parse(prod.tags) : prod.tags,
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos do usuário:', error);
      throw error;
    }
  };

export const createProduct = async (productData: CreateProductParams): Promise<ApiResponse> => {
  try {
    // Obter o token do usuário logado
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }
    
    const token = await AsyncStorage.getItem('userToken');
    
    // Preparar os dados para envio
    const formData = new FormData();
    
    // Adicionar campos textuais
    formData.append('user_id', productData.user_id.toString());
    formData.append('nome', productData.nome);
    formData.append('descricao', productData.descricao);
    formData.append('estado', productData.estado);
    formData.append('valor', productData.valor.toString());
    formData.append('city', productData.city);
    formData.append('state', productData.state);
    formData.append('tags', JSON.stringify(productData.tags));
    
    // Adicionar imagens
    productData.fotos.forEach((uri, index) => {
      formData.append('productPictures', {
        uri,
        type: 'image/jpeg', // ou detectar o tipo real da imagem
        name: `product-image-${index}.jpg`
      } as any);
    });

    const response = await fetch(`${API_URL}/prod/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Erro ao criar produto');
    }

    return data;
  } catch (error) {
    console.error('Erro no createProduct:', error);
    throw error;
  }
};