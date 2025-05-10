import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useAlert } from '../context/AlertContext';
import { acceptTrade, getTrades, rejectTrade, Trade } from '../services/tradeService'
import { API_URL } from '../config';
import StarRating from 'react-native-star-rating-widget';
type ReceivedProposalsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReceivedProposalsScreen'>;

interface Props {
  navigation: ReceivedProposalsScreenNavigationProp;
}

interface User {
    id: number;
  }

const ReceivedProposalsScreen: React.FC<Props> = ({ navigation }) => {
  const [proposals, setProposals] = useState<Trade[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setSelectedUserId] = useState<Number>();
  const [tradeId, setSelectedProposolId] = useState<Number>();
  const [rating, setRating] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { showAlert } = useAlert();


  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
  
    loadUser();
  }, []);

  useEffect(() => {
    const loadProposals = async () => {
      if (!user) return; // Ensure user is not null
      setLoading(false);
      const trades = await getTrades();
      setProposals(trades.trades.list.filter((t: Trade) => t.user_reciver === Number(user.id)).filter((t: Trade) => t.status === 0));
    };

    loadProposals();
  }, [user]);

  const handleAccept = async (proposal: Trade) => {
    setSelectedProposolId(proposal.id);
    setSelectedUserId(proposal.user_sender)
    setShowRatingModal(true);
  };

  const confirmAccept = async () => {
    console.log(userId , tradeId, rating);
    if(Number(rating) == 0){
      showAlert('warning', 'Alerta', 'Você precisa avaliar o usuário.');
    }else{

      try {
        const response = await acceptTrade(Number(userId), Number(tradeId), Number(rating));
        if (response.success) {
          showAlert('success', 'Sucesso', 'A troca foi registrada com sucesso.');
          setShowRatingModal(false);
          setProposals((prevTrades) => prevTrades.filter((trade) => trade.id !== tradeId));
        } else {
          showAlert('error', 'Erro', 'Não foi possível registrada a troca.');
        }
      } catch (error) {
        console.error('Erro ao registrada troca:', error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao tentar registrada a troca.');
      }
      
    }
  };

  const handleReject = async (id: number) => {
    Alert.alert(
      'Rejeitar Proposta',
      'Tem certeza de que deseja rejeitar esta troca?',
      [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: async () => {
            try {
              const response = await rejectTrade(id);
              if (response.success) {
                showAlert('success', 'Sucesso', 'A troca foi cancelada com sucesso.');
                setProposals((prevTrades) => prevTrades.filter((trade) => trade.id !== id));
              } else {
                showAlert('error', 'Erro', 'Não foi possível cancelar a troca.');
              }
            } catch (error) {
              console.error('Erro ao cancelar troca:', error);
              showAlert('error', 'Erro', 'Ocorreu um erro ao tentar cancelar a troca.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderProposal = ({ item }: { item: Trade }) => (
    <View style={styles.proposalCard}>
      <Text style={styles.status}>Status: {
              item.status === 0 ? '⏳ Pendente' : 
              item.status === 1 ? '✅ Aceita' : 
              item.status === 2 ? '❌ Recusada' : 
              item.status === 3 ? '🚫 Cancelada' : ''
            }</Text>
      
      <View style={styles.productSection}>
        

        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetail', { productId: Number(item.id1) })}>
          <Text style={styles.sectionTitle}>Seu Produto:</Text>
          {JSON.parse(String(item.fotos1)) && JSON.parse(String(item.fotos1)).length > 0 && (
            <Image source={{ uri: `${API_URL}/pictures${JSON.parse(String(item.fotos1))[0].replace(/\\/g, '/')}` }} style={styles.productImage} />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.nome1}</Text>
              <Text>R$ {item.valor1.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        <Image source={require("../assets/swap.png")} style={{width: 20, height: 20, margin: 10}}/>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetail', { productId: Number(item.id2) })}>
          <Text style={styles.sectionTitle}>Produto Oferecido:</Text>
          {JSON.parse(String(item.fotos2)) && JSON.parse(String(item.fotos2)).length > 0 && (
            <Image source={{ uri: `${API_URL}/pictures${JSON.parse(String(item.fotos2))[0].replace(/\\/g, '/')}` }} style={styles.productImage} />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.nome2}</Text>
              <Text>R$ {item.valor2.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        
      </View>

      <Text style={styles.message}>Mensagem: {item.message ? item.message : "[Sem mensagem]"}</Text>

      {item.status === 0 && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAccept(item)}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={proposals}
        renderItem={renderProposal}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma proposta recebida</Text>
        }
      />

      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Avaliar Usuário</Text>
            <StarRating
              rating={Number(rating)}
              onChange={(newRating) => setRating(String(newRating))}
              starSize={30}
              enableHalfStar={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedProposolId(0);
                  setShowRatingModal(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAccept}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proposalCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  productInfo: {
    paddingTop: 8,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productSection: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  message: {
    color: '#666',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default ReceivedProposalsScreen;