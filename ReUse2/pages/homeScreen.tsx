import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { FloatingAction } from 'react-native-floating-action';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { logoutUser } from '../services/loginServices';
import { getProducts } from '../services/homeServices.ts';
import { API_URL } from '../config.ts';
import { useAlert } from '../context/AlertContext';


const API_BASE_URL = API_URL;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const statesAndCities: { [key: string]: string[] } = {
  Todos: ['Todos'],
  AC: ['Acrelândia', 'Assis Brasil', 'Brasiléia'],
  AL: ['Água Branca', 'Anadia', 'Arapiraca'],
  AM: ['Alvarães', 'Amaturá', 'Anamã'],
  AP: ['Amapá', 'Calçoene', 'Cutias'],
  BA: ['Abaíra', 'Abaré', 'Acajutiba'],
  CE: ['Abaiara', 'Acarape', 'Acaraú'],
  DF: ['Brasília'],
  ES: ['Afonso Cláudio', 'Água Doce do Norte'],
  GO: ['Abadia de Goiás', 'Abadiânia'],
  MA: ['Açailândia', 'Afonso Cunha'],
  MG: ['Abadia dos Dourados', 'Abaeté'],
  MS: ['Água Clara', 'Alcinópolis'],
  MT: ['Acorizal', 'Água Boa'],
  PA: ['Abaetetuba', 'Abel Figueiredo'],
  PB: ['Água Branca', 'Aguiar'],
  PE: ['Abreu e Lima', 'Afogados da Ingazeira'],
  PI: ['Acauã', 'Agricolândia'],
  PR: ['Abatiá', 'Adrianópolis'],
  RJ: ['Angra dos Reis', 'Aperibé'],
  RN: ['Acari', 'Açu'],
  RO: ['Alta Floresta d\'Oeste', 'Alto Alegre dos Parecis'],
  RR: ['Alto Alegre', 'Amajari'],
  RS: ['Aceguá', 'Água Santa'],
  SC: ['Abdon Batista', 'Abelardo Luz'],
  SE: ['Amparo de São Francisco', 'Aquidabã'],
  SP: ['Adamantina', 'Adolfo'],
  TO: ['Abreulândia', 'Araguaina', 'Palmas', 'Colinas do Tocantins'],
};

interface Filter {
  state: string;
  city: string;
  tags: string;
  minValue: string;
  maxValue: string;
}

const colors = {
  primary: '#2f95dc',
  text: '#FFFF',
  border: '#0',
  background: '#386ea1',
};


const actions = [
  {
    text: 'Adicionar Produto',
    icon: require('../assets/plus.png'),
    name: 'bt_add',
    position: 1,
  },
  {
    text: 'Trocas Pendentes',
    icon: require('../assets/logo.png'),
    name: 'bt_trades',
    position: 2,
  },
  {
    text: 'Meu perfil',
    icon: require('../assets/profile.png'),
    name: 'bt_profile',
    position: 3,
  },
  {
    text: 'Deslogar',
    icon: require('../assets/logout.png'),
    name: 'bt_logoff',
    position: 4,
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  interface User {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  }

  interface Product {
    id: number;
    name: string;
    description: string;
    quality: string;
    tags: string[];
    value: number;
    city: string;
    state: string;
    images: string[];
  }
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<Filter>({
    state: '',
    city: '',
    tags: '',
    minValue: '',
    maxValue: '',
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stateField, setStateField] = useState<string>('Todos');
  const [city, setCity] = useState<string>('');
  
  // Atualize o state
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

    const { showAlert } = useAlert();

  // Valor animado para exibir os filtros extras
  const filtersAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getProducts();
        
        // Mapear os dados da API para o formato esperado pelo seu componente
        const mappedProducts = productsData.map((prod: any) => {
          // Parsear as fotos que vêm como string JSON
          let parsedFotos = [];
          try {
            parsedFotos = typeof prod.fotos === 'string' ? 
              JSON.parse(prod.fotos.replace(/\\/g, '')) : 
              prod.fotos;
          } catch (e) {
            console.error('Erro ao parsear fotos:', e);
            parsedFotos = [];
          }
    
          // Converter para o formato de URL correta
          const images = parsedFotos.map((foto: string | { url: string }) => {
            if (typeof foto === 'string') {
              return `${API_BASE_URL}/pictures${foto.replace(/\\/g, '/')}`;
            } else if (foto.url) {
              return `${API_BASE_URL}/pictures${foto.url.replace(/\\/g, '/')}`;
            }

            //console.log(foto);
            return '';
          }).filter((url: string) => url !== '');
          //console.log(images);
          return {
            id: prod.id,
            name: prod.nome,
            description: prod.descricao,
            quality: prod.estado,
            tags: typeof prod.tags === 'string' ? JSON.parse(prod.tags) : prod.tags,
            value: prod.valor,
            city: prod.city,
            state: prod.state,
            images: images,
          };
        });
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showAlert('error', 'Erro', 'Não foi possível carregar os produtos');
      } finally {
        setIsLoading(false);
      }
    };
  
    const onRefresh = () => {
      setRefreshing(true);
      loadProducts();
    };

    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          //console.log('Dados do usuário:', userData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
  
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts();
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);


  // Ao focar o campo de busca, expande os filtros
  const handleFocusSearch = () => {
    setShowFilters(true);
    Animated.timing(filtersAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const filteredProducts = products.filter((prod) => {
    if (search && !prod.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (showFilters) {
      if(filter.state !== 'Todos'){
        if (filter.state && prod.state !== filter.state) return false;
        if (filter.city && prod.city !== filter.city) return false;
      }
      if (filter.minValue && prod.value < parseFloat(filter.minValue))
        return false;
      if (filter.maxValue && prod.value > parseFloat(filter.maxValue))
        return false;
    }
    return true;
  });

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      {item.images && item.images.length > 0 ? (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.itemImage} 
          resizeMode="cover"
        />
      ) : (
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.itemImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.textOverlay}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {item.value.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><Text>{'\n'}{'\n'}</Text>
      <View style={{marginTop: 30}} ></View>
      <Image source={ require('../assets/logo.png')} style={styles.logoImage} />

      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() =>  navigation.navigate('Profile')}
        >
        {user && (
            <>
            <View style={{ marginLeft: 5 }}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRating}>{'⭐'.repeat(Math.floor(user.rating || 0))}</Text>
            </View>
            
            <Image
              source={
                user.profilePicture 
                  ? { 
                      uri: `${API_BASE_URL}/pictures${user.profilePicture.replace(/\\/g, '/')}`,
                      cache: 'reload'
                    } 
                  : require('../assets/profile.png')
              }
              defaultSource={require('../assets/profile.png')}
              onError={() => {}}
              style={styles.userImage}
            />
            </>
        )}
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="gray"
          value={search}
          onFocus={handleFocusSearch}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {showFilters && (
          <Animated.View
            style={[
              styles.filtersContainer,
              {
                opacity: filtersAnim,
                height: filtersAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
              },
            ]}
          >
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={stateField}
              onValueChange={(itemValue) => setStateField(itemValue)}
              style={styles.picker}
            >
              {Object.keys(statesAndCities).map((st) => (
                <Picker.Item key={st} label={st} value={st} />
              ))}
            </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={city}
            onValueChange={(itemValue) => setCity(itemValue)}
            style={styles.picker}
          >
          {(statesAndCities[stateField] || []).map((ct) => (
            <Picker.Item key={ct} label={ct} value={ct} />
          ))}
          </Picker>
        </View>
            <TextInput
              placeholder="Valor Min"
              placeholderTextColor="gray"
              value={filter.minValue}
              onChangeText={(text) => setFilter({ ...filter, minValue: text })}
              style={styles.filterInput}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Valor Max"
              placeholderTextColor="gray"
              value={filter.maxValue}
              onChangeText={(text) => setFilter({ ...filter, maxValue: text })}
              style={styles.filterInput}
              keyboardType="numeric"
            />
          </Animated.View>
        )}
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
        <Text style={styles.text} >Conheça os itens que estão disponíveis para troca</Text>
        
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 80 }}
        />
      </>
      )}

      <FloatingAction
        actions={actions}
        floatingIcon={
          <Image
            source={require('../assets/menu.png')}
            style={{ width: 80, height: 80 }}
          />
        }
        onPressItem={async (name) => {
          if (name === 'bt_add') {
            navigation.navigate('Product');
          }
          if (name === 'bt_trades') {
            navigation.navigate('ReceivedProposalsScreen');
          }
          if (name === 'bt_profile') {
            navigation.navigate('Profile');
          }
          if (name === 'bt_logoff') {
            await logoutUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }

        }}
        
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  userName: {
    fontSize: 18,
    marginRight: 10,
    fontWeight: '600',
    color: colors.text,
  },
  pickerContainer: {
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 5,
    padding: 2,
    height: 40,
    borderRadius: 12,
    color: 'black',
    fontFamily: 'Poppins',
    fontSize: 16,
    backgroundColor: 'white',
  },
  
  picker: { fontSize: 15, height: 50, width: '100%', color: 'black' },
  viewProfile: {
    color: colors.primary,
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    backgroundColor: colors.background,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  regionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  regionButton: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionText: {
    color: colors.text,
    fontWeight: '500',
  },
  item: {
    marginTop: 16,
    backgroundColor: 'white',
    padding: 16,
    borderWidth: .1,
    borderRadius: 12,
    borderColor: colors.border,

  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
    textAlign: 'center',
    
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    padding: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  viewButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    backgroundColor: colors.background,
    position: 'absolute',
    top: 40,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 0,
    elevation: 0,
    zIndex: 0,

  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  logoImage: {
    width: 40,
    height: 42,
    
    position: 'absolute',
    top: 45,
    left: 20,
  },
  
  userRating: {
    fontSize: 12,
    color: 'gray',
  },
  itemDescription: { color: 'black', marginBottom: 5 },
  filtersContainer: {
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  filterInput: {
    borderRadius : 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    marginBottom: 5,
    padding: 6,
    color: 'black',
  },
});

export default HomeScreen;
