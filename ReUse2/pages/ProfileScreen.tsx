import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { API_URL } from '../config.ts';
import HomeScreen from './homeScreen.tsx';
import { RootStackParamList } from '../App';
import { useAlert } from '../context/AlertContext';
import {getUserProducts, Product} from '../services/productService';
import { getTrades, Trade, cancelTrade} from '../services/tradeService';


const API_BASE_URL = API_URL;
const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  interface User {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  }
  const [activeTab, setActiveTab] = useState<'trades' | 'receivedTrades' | 'available' | 'traded'>('trades');
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showAlert } = useAlert();

  // Carregar dados do usuário
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
    const loadProducts = async () => {
      if (user && user.id) {
        try {
          const products = await getUserProducts(Number(user.id));
          
          if (Array.isArray(products)) {
            setProducts(products);
          } else {
            console.error('getUserProducts retornou algo inesperado:', products);
            setProducts([]);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        }
      }
    }
    loadProducts();
  }, [user]);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        const trades = await getTrades();
        
        if (trades) {
          setTrades(trades.trades.list);
        } else {
          console.error('getTrades retornou algo inesperado:', trades);
          setTrades([]);
        }
      } catch (error) {
        console.error('Erro ao carregar trocas:', error);
      }
    };
    
    // Chama o loadTrades apenas uma vez ou quando o usuário for carregado
    if (user) {
      loadTrades();
    }
  }, [user]);

  // Filtros para os diferentes tipos de produtos
  const availableProducts = products.filter(p => p.status === 1);
  const tradedProducts = products.filter(p => p.status === 0);
  
  const sendProposol = user
  ? trades.filter(t => t.user_sender === Number(user.id))
  : [];
  const receivedProposals = user
  ? trades.filter(t => t.user_reciver === Number(user.id))
  : [];


  //console.log(receivedProposals);

  // Renderizar abas
  const renderTabButton = (title: string, tabName: 'trades' | 'receivedTrades' | 'available' | 'traded') => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTab]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const handleCancelTrade = async (id: number) => {
    Alert.alert(
      'Confirmar Cancelamento',
      'Tem certeza de que deseja cancelar esta troca?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const response = await cancelTrade(id);
              if (response.success) {
                showAlert('success', 'Sucesso', 'A troca foi cancelada com sucesso.');
                setTrades((prevTrades) => prevTrades.filter((trade) => trade.id !== id));
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


  // Componente de card de produto reutilizável
  const ProductCard = ({ product }: { product: Product }) => (
    <>
     <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetail', { productId: Number(product.id) })}
        >
    <View style={styles.productCard}>
      {product.fotos && product.fotos.length > 0 && (
        <Image source={{ uri: `${API_URL}/pictures${product.fotos[0]}` }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.nome}</Text>
        <Text>R$ {product.valor.toFixed(2)}</Text>
        <Text>Qualidade: {product.estado}</Text>
      </View>
    </View>
    </TouchableOpacity>
    </>
  );

  const TradeCard = ({ trade }: { trade: Trade }) => (
    <>
    <TouchableOpacity onPress={() => navigation.navigate('ReceivedProposalsScreen')}>
      <View style={styles.tradeItem}>
         <Text style={styles.tradeStatus}>
            {
              trade.status === 0 ? '⏳ Pendente' : 
              trade.status === 1 ? '✅ Aceita' : 
              trade.status === 2 ? '❌ Recusada' : 
              trade.status === 3 ? '🚫 Cancelada' : ''
            }
          </Text>
          <View style={styles.productCard}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: Number(trade.id1) })}
            >
              {JSON.parse(String(trade.fotos1)) && JSON.parse(String(trade.fotos1)).length > 0 && (
                <Image source={{ uri: `${API_BASE_URL}/pictures${JSON.parse(String(trade.fotos1))[0].replace(/\\/g, '/')}` }} style={styles.productImage} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{trade.nome1}</Text>
                <Text>R$ {trade.valor1.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <Image source={require("../assets/swap.png")} style={styles.swapIcon} />
          
          <View style={styles.productCard}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: Number(trade.id2) })}>
              {JSON.parse(String(trade.fotos2)) && JSON.parse(String(trade.fotos2)).length > 0 && (
                <Image source={{ uri: `${API_BASE_URL}/pictures${JSON.parse(String(trade.fotos2))[0].replace(/\\/g, '/')}` }} style={styles.productImage} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{trade.nome2}</Text>
                <Text>R$ {trade.valor2.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
      </View>
    </TouchableOpacity>
    </>
    
  );
  

  return (
    <View style={styles.container}>
      <Image source={ require('../assets/logo.png')} style={styles.logoImage} />
      <View style={styles.voltar} >
        <TouchableOpacity onPress={ () => { navigation.goBack()} }>
          <Image source={require('../assets/arrow-left.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
      {user && (
        <>
          {/* Header do perfil */}
          <View style={styles.profileHeader}>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.rating}>
                Avaliação: {user.rating ? '⭐'.repeat(Math.floor(user.rating || 0)) : 'Sem avaliação'}
              </Text>
            </View>
            <Image
              source={user.profilePicture 
                ? { uri: `${API_BASE_URL}/pictures${user.profilePicture.replace(/\\/g, '/')}` } 
                : require('../assets/profile.png')}
              style={styles.profileImage}
            />
          </View>

          {/* Abas de navegação */}
          <View style={styles.tabContainer}>
            {renderTabButton('Propostas Enviadas', 'trades')}
            {renderTabButton('Propostas Recebidas', 'receivedTrades')}
            {renderTabButton('Meus Produtos', 'available')}
            {renderTabButton('Produtos Trocados', 'traded')}
          </View>

          
          {activeTab === 'trades' && (
            <FlatList
              data={sendProposol}
              renderItem={({ item }) => (
                <View style={styles.tradeItem}>
                  <Text style={styles.tradeStatus}>
                    {item.status === 0 ? '⏳ Pendente' : 
                    item.status === 1 ? '✅ Aceita' : 
                    item.status === 2 ? '❌ Recusada' : 
                    item.status === 3 ? '🚫 Cancelada' : ''}
                  </Text>

                  {/* Produto ofertado pelo outro usuário */}
                  
                  <View style={styles.productCard}>
                    <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: Number(item.id1) })}>
                      {JSON.parse(String(item.fotos1)) && JSON.parse(String(item.fotos1)).length > 0 && (
                        <Image source={{uri: `${API_BASE_URL}/pictures${JSON.parse(String(item.fotos1))[0].replace(/\\/g, '/')}`}} style={styles.productImage} />
                        
                      )}
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.nome1}</Text>
                        <Text>R$ {item.valor1.toFixed(2)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  

                  <Image source={require('../assets/swap.png')} style={styles.swapIcon} />

                  {/* Produto do usuário logado */}
                  
                  <View style={styles.productCard}>
                    <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: Number(item.id2) })}>
                      {JSON.parse(String(item.fotos2)) && JSON.parse(String(item.fotos2)).length > 0 && (
                        <Image source={{uri : `${API_BASE_URL}/pictures${JSON.parse(String(item.fotos2))[0].replace(/\\/g, '/')}`}} style={styles.productImage} />
                      )}
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.nome2}</Text>
                        <Text>R$ {item.valor2.toFixed(2)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  

                  {item.status === 0 && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelTrade(item.id)}
                    >
                      <Image source={require('../assets/cancel_icon.png')} style={{ width: 40, height: 40 }} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            
          )}
          {/* */}
          {activeTab === 'receivedTrades' && (
            <FlatList
              data={receivedProposals}
              renderItem={({ item }) => (

                <TradeCard trade={item} />
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.gridContent}
            />
          )}
             
          {activeTab === 'available' && (
            <FlatList
              data={availableProducts}
              numColumns={2}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.gridContent}
            />
          )}
          {activeTab === 'traded' && (
            <FlatList
              data={tradedProducts}
              numColumns={2}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.gridContent}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#386ea1',
  },
  tradeCard: {
    backgroundColor: '#e8e6e6',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    elevation: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    fontSize: 14,
    color: '#f39c12',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#386EA1',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#386EA1',
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    width: (width / 2) - 24,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 4,
  },
  productInfo: {
    paddingTop: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tradeItem: {
    backgroundColor: '#e8e6e6',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    elevation: 2,
  },
  voltar: {
    justifyContent: 'flex-end',
    marginTop: 48,
    fontSize: 16,
    alignItems: 'flex-end',
    right: 10,

    marginBottom: 20,

  },
  logoImage: {
    width: 40,
    height: 42,
    
    position: 'absolute',
    top: 45,
    left: 20,
  },
  tradeStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#386EA1',
  },
  tradedPairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '0',
    borderRadius: 8,
    padding: 3,
    margin: 8,
    elevation: 0,
  },
  swapIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 2,
  },
  cancelButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  gridContent: {
    paddingHorizontal: 16,
  },
});

export default ProfileScreen;