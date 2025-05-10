import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, Linking, Modal, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useAlert } from '../context/AlertContext';
import { loginUser, checkAuthToken } from "../services/loginServices";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { showAlert } = useAlert();
    const [showContactModal, setShowContactModal] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
      const checkAuthentication = async () => {
          try {
              const isAuthenticated = await checkAuthToken();
              if (isAuthenticated) {
                  navigation.replace('Home');
              }
          } catch (error) {
              console.error('Erro ao verificar autenticação:', error);
          } finally {
              setIsCheckingAuth(false);
          }
      };

      checkAuthentication();
    }, [navigation]);

    const handleLogin = async () =>  {
        // verifica se o email e a senha estão preenchidos e Validar os campos

        if (!email || !password || !email.includes('@') || password.length < 6) {
            showAlert('error', 'Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        await loginUser(email, password)
            .then((response) => {
                showAlert('success', 'Sucesso', `Login bem-sucedido`);
                // Navegar para a próxima tela ou fazer o que for necessário após o login
                navigation.navigate('Home');
            })
            .catch((error) => {
                showAlert('error', 'Erro', `Erro no login: ${error} `);
                // Exibir mensagem de erro para o usuário
            });
    };

    if (isCheckingAuth) {
      return (
          <View style={[styles.container0, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#386EA1" />
          </View>
      );
    }

    return (
        <View style={styles.container0}>
            <View style={styles.container1}>
        <Image style={styles.logo} source={require('../assets/logo_v2.png')} />
        <Text style={styles.title1}>Bem vindo(a) ao ReUse</Text>
        <Text style={styles.subtitle1}>transforme objetos{'\n'}parados em novas oportunidades!</Text>
        <Text style={styles.subtitle2}>É sua primeira vez na plataforma?</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('Register')} >
          <Text style={styles.registerbutton}>Realize seu cadastro agora mesmo!</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle3}>Facil e rápido!</Text>
      </View>

      <View style={styles.container2}>
        <Text style={styles.title}>Realize o login na plataforma!</Text>
        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput 
            placeholder="Email" 
            placeholderTextColor="#FFFFFF"
            autoCapitalize='none'
            value={email} 
            onChangeText={setEmail} 
            style={styles.inputText} 
          />
        </LinearGradient>

        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput 
            placeholder="Senha" 
            placeholderTextColor="#FFFFFF"
            autoCapitalize='none'
            value={password} 
            onChangeText={setPassword} 
            style={styles.inputText} 
            secureTextEntry 
          />
        </LinearGradient>
        

        <TouchableOpacity onPress={handleLogin} >
          <Text style={styles.loginbutton}>ENTRAR</Text>
        </TouchableOpacity>

        <View style={styles.container3}>
          <TouchableOpacity onPress={() => navigation.navigate('Termos')} >
            <Text style={styles.btn_text}>Termos de Uso</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={ () => setShowContactModal(true)} >
            <Text style={styles.btn_text}>Contato</Text>
          </TouchableOpacity>
        </View>

        

      </View>

        <Modal
          visible={showContactModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowContactModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowContactModal(false)}
                >
                  <Text style={styles.closeButtonText}>❌</Text>
                </TouchableOpacity>
                
                  <Text style={styles.modalTitle}>Está com alguma dúvida?</Text>
                
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Entre em contato{"\n"}conosco pelo nosso e-mail:</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:suporte@reuse.com.br')}>
                    <Text style={styles.contactValue}>suporte@reuse.com.br</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
    inputGradient: {
      borderRadius: 12,
      borderColor: '#FFFFFF',
      borderWidth: .3,
      borderEndEndRadius: 12,
      borderEndStartRadius: 12,
      borderStartEndRadius: 12,
      borderStartStartRadius: 12,
      marginBottom: 18,
      height: 50,
      padding: 2,
    },
    container: {
       // Ou sua cor de fundo
    },
  
    inputText: {
      flex: 1,
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      padding: 10,
      borderRadius: 12,
    },
    logo: { 
      height: 80,
      width: 80,
      resizeMode: 'contain', 
      alignSelf: 'center',
      marginTop: 0,
      marginBottom: 20,
    },
  
    container1: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
  
    },
  
    title1: {
      fontSize: 20,
      color: '#386ea1',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Poppins',
    },
  
    subtitle1: {
      fontSize: 18,
      textAlign: 'center',
      color: '#2c2c2c',
      fontFamily: 'Poppins',
    },
  
    subtitle2: {
      marginTop: 20,
      marginBottom: 10,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#386ea1',
      fontFamily: 'Poppins',
    },
  
    subtitle3: {
      marginTop: 20,
      marginBottom: 10,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'right',
      color: '#386ea1',
      fontFamily: 'Poppins',
    },
  
    registerbutton: {
      fontSize: 18,
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      backgroundColor: '#386ea1',
      padding: 10,
      borderRadius: 12,
    },
  
    btn_text: {
      fontSize: 15,
      color: 'white',
      fontWeight: 'thin',
      fontFamily: 'Poppins',
    },
  
    container0: {
      flex: 1,
      justifyContent: 'center',
      padding: 0,
      backgroundColor: '#FFFFFF',
    },
  
    container2: { 
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      borderTopEndRadius: 18,
      borderTopStartRadius: 18,
      backgroundColor: '#386ea1'
    },
  
    container3: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
  
    loginbutton: {
      marginTop: 20,
      fontSize: 18,
      color: '#386ea1',
      fontWeight: 'bold',
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 12,
  
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Poppins',
      marginTop: 10,
      marginBottom: 40,
      color: '#FFFFFF',
      textAlign:'center',
      fontWeight: 'bold',
    },
  
    input: {
      borderRadius: 12,
      color: '#FFFFFF',
      borderWidth: 1,
      marginBottom: 15,
      padding: 8
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro semi-transparente
    },
    modalContainer: {
      width: '80%', // Largura do modal
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 0.3,
      borderColor: '#FFFFFF',
      padding: 20,
      // Remova marginTop e centralize verticalmente
    },
    modalTitle: {
      fontSize: 20,
      color: '#386EA1',
      textAlign: 'center',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      marginBottom: 20,
    },
    contactItem: {
      marginBottom: 15,
    },
    contactLabel: {
      fontSize: 16,
      color: '#386EA1',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      alignContent: 'center',
      textAlign: 'center',
    },
    contactValue: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: 'bold',
  
      fontFamily: 'Poppins',
      alignContent: 'center',
      textAlign: 'center',
      borderColor: '#386EA1',
      borderWidth: 1,
      borderRadius: 12,
      marginTop: 15,
      backgroundColor: '#386EA1',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    closeButtonText: {
      color: '#386EA1',
      textAlign: 'center',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      fontSize: 16,
    },
  
  });

export default LoginScreen;