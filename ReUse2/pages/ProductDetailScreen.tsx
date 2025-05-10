import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import Modal from 'react-native-modal';
import { useAlert } from '../context/AlertContext';
import { getProductById, getUserProducts, Product } from '../services/productService';
import {createTradeProposal, TradeProposal} from '../services/tradeService.ts'
import { API_URL } from '../config.ts';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

interface ProductDetailScreenProps {
  route: ProductDetailScreenRouteProp;
}

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route }) => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const { showAlert } = useAlert();
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const navigation = useNavigation();
  const { productId } = route.params;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega dados do usuário logado
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }

        //console.log(productId);

        // Carrega detalhes do produto
        const product = await getProductById(productId);
        setProductDetails(product);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('error', 'Erro', 'Não foi possível carregar os dados do produto');
      }
    };

    loadData();
  }, [productId]);

  const loadUserProducts = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      const products = await getUserProducts(currentUser.id);
      setUserProducts(products.filter(p => p.id !== productId).filter(p => p.status !== 0));
    } catch (error) {
      console.error('Erro ao carregar produtos do usuário:', error);
      showAlert('error', 'Erro', 'Não foi possível carregar seus produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = () => {
    if (!currentUser) {
      showAlert('warning', 'Atenção', 'Você precisa estar logado para realizar trocas');
      return;
    }
    
    loadUserProducts();
    setShowTradeModal(true);
  };

  const handleSubmitTrade = async () => {
    if (!selectedProduct || !productDetails) return;

    try {
      setLoading(true);
      
      const proposal: TradeProposal = {
        user_id: currentUser.id,
        product_id: productDetails.id,
        offered_product_id: selectedProduct.id,
        message: message
      };

      await createTradeProposal(proposal);
      
      setShowTradeModal(false);
      setSelectedProduct(null);
      setMessage('');
      
      showAlert('success', 'Sucesso', 'Proposta de troca enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      showAlert('error', 'Erro', 'Não foi possível enviar a proposta de troca');
    } finally {
      setLoading(false);
    }
  };

  if (!productDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const productImages = productDetails.fotos.map(foto => {
    if (typeof foto === 'string') {
      return `${API_URL}/pictures${foto.replace(/\\/g, '/')}`;
    } else if (foto.url) {
      return `${API_URL}/pictures${foto.url.replace(/\\/g, '/')}`;
    }
    return '';
  }).filter(url => url !== '');

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logoImage} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.voltar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../assets/arrow-left.png')} style={{ width: 40, height: 40 }} />
          </TouchableOpacity>
        </View>
        
        {productImages.length > 0 ? (
          <ScrollView horizontal pagingEnabled style={styles.imageScroll}>
            {productImages.map((uri, index) => (
              <TouchableOpacity key={index} onPress={() => {
                setSelectedImage(uri);
                setFullScreenVisible(true);
              }}>
                <Image source={{ uri }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Image source={require('../assets/logo.png')} style={styles.image} />
        )}
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{productDetails.nome}</Text>
          <Text style={styles.text}>
            {productDetails.avaliacao ? '⭐'.repeat(productDetails.avaliacao) : 'Anunciante sem avaliação'}
          </Text>
          <Text style={styles.text}>
            Status: {productDetails.status === 1 ? 'Disponível para troca' : 'Trocado'}
          </Text>
          <Text style={styles.descricao}>{productDetails.descricao}</Text>
          <Text style={styles.text}>Estado: {productDetails.estado}</Text>
          <Text style={styles.text}>R$ {productDetails.valor.toFixed(2)}</Text>
          <Text style={styles.text}>
            Local: {productDetails.city} - {productDetails.state}
          </Text>
          <Text style={styles.text}>Interessado em trocar por:</Text>
          <View style={styles.tagsContainer}>
            {productDetails.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Só exibe o botão se o usuário logado não for o dono do anúncio */}
      {currentUser && currentUser.id !== productDetails.user_id && productDetails.status == 1 && (
        <TouchableOpacity style={styles.tradeButton} onPress={handleTrade}>
          <Text style={styles.tradeButtonText}>Trocar</Text>
        </TouchableOpacity>
      )}

      <Modal
        isVisible={fullScreenVisible}
        onBackdropPress={() => setFullScreenVisible(false)}
        style={styles.fullscreenModal}
      >
        <TouchableOpacity style={styles.fullscreenContainer} onPress={() => setFullScreenVisible(false)}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
          ) : (
            <Text style={{ color: 'white' }}>Imagem não carregada</Text>
          )}
        </TouchableOpacity>
      </Modal>
      
      <Modal
        isVisible={showTradeModal}
        onBackdropPress={() => setShowTradeModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowTradeModal(false)}
          >
            <Image source={require('../assets/cancel_icon.png')} style={{ width: 40, height: 40 }} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Selecione seu item para troca</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <FlatList
              data={userProducts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.productItem,
                    selectedProduct?.id === item.id && styles.selectedItem
                  ]}
                  onPress={() => setSelectedProduct(item)}
                >
                  {item.fotos && item.fotos.length > 0 ? (
                    <Image
                      source={{ uri: `${API_URL}/pictures${item.fotos[0]}` }}
                      style={styles.productImage}
                    />
                  ) : (
                    <Image
                      source={require('../assets/logo.png')}
                      style={styles.productImage}
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.nome}</Text>
                    <Text>R$ {item.valor.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TextInput
            placeholder="Mensagem para o vendedor..."
            placeholderTextColor="#666"
            style={styles.messageInput}
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedProduct || loading) && { opacity: 0.5 }
            ]}
            onPress={handleSubmitTrade}
            disabled={!selectedProduct || loading }
          >
            <Text style={styles.buttonText}>Enviar Proposta</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  scrollContainer: { paddingBottom: 80 },
  imageScroll: { height: 250 },
  image: { width, height: 250, resizeMode: 'contain' },
  detailsContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { 
    backgroundColor: '#ddd', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginRight: 5, 
    marginBottom: 5 
  },
  fullscreenModal: {
    backgroundColor: 'transparent',
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  tagText: { color: 'black' },
  descricao: { fontSize: 18, color: 'white', marginBottom: 10 },
  text: { fontSize: 16, color: 'white', marginBottom: 5 },
  tradeButton: {
    position: 'absolute',
    bottom: 20,
    left: (width - 200) / 2,
    width: 200,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
  },
  tradeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
  },
  logoImage: {
    width: 40,
    height: 42,
    position: 'absolute',
    top: 45,
    left: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    marginVertical: 15,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  voltar: {
    justifyContent: 'flex-end',
    marginTop: 45,
    fontSize: 16,
    alignItems: 'flex-end',
    right: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
});

export default ProductDetailScreen;