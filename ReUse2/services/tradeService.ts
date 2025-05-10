// services/tradeService.ts
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface ApiResponse {
    success: boolean;
    trade?: any;
    trades?: any;
    message?: string;
    error?: string;
}


export interface TradeProposal {
    user_id: number;
    product_id: number;
    offered_product_id: number;
    message: string;
}

export interface Trade {
  id: number,
  user_sender: number,
  user_reciver: number,
  user_id: number,
  product_id: number,
  offered_product_id: number,
  message: string,
  status: number,
  id1: number,
  fotos1: (string | { url: string })[];
  nome1: string,
  valor1: number,
  id2: number,
  fotos2: (string | { url: string })[];
  nome2: string,
  valor2: number,
}

export const createTradeProposal = async (proposal: TradeProposal): Promise<ApiResponse> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/trades/propose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(proposal),
      });
  
      const data: ApiResponse = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao enviar proposta');
      }
  
      return data;
    } catch (error) {
      console.error('Erro ao enviar proposta de troca:', error);
      throw error;
    }
};

export const cancelTrade = async (tradeid: number) => {
  try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/trades/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 'tradeid': tradeid }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao cancelar proposta');
      }

      return data;
  } catch (error) {
      console.error('Erro ao cancelar proposta de troca:', error);
      throw error;
  }
}

export const rejectTrade = async (tradeid: number) => {
  try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/trades/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 'tradeid': tradeid }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao rejeitar proposta');
      }

      return data;
  } catch (error) {
      console.error('Erro ao rejeitar proposta de troca:', error);
      throw error;
  }
}


export const acceptTrade = async (userid: number, tradeid: number, rating: number) => {
  try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/trades/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          'userid': userid,
          'tradeid': tradeid,
          'rating': rating
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao registrar proposta');
      }

      return data;
  } catch (error) {
      console.error('Erro ao registrar proposta de troca:', error);
      throw error;
  }
}

export const getTrades = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/trades/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
    
        const data: ApiResponse = await response.json();
    
        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error || 'Erro ao enviar proposta');
        }
    
        return data;
    } catch (error) {
        console.error('Erro ao enviar proposta de troca:', error);
        throw error;
    }
}