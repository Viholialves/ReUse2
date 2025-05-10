// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { useAlert } from '../context/AlertContext';

import { registerUser, validateName, validateEmail, validatePassword } from '../services/registerServices';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}


const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.assets && response.assets.length > 0) {
        setProfilePicture(response.assets[0].uri || null);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 1 }, response => {
      if (response.assets && response.assets.length > 0) {
        setProfilePicture(response.assets[0].uri || null);
      }
    });
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !password2 || !profilePicture) {
        showAlert('warning', 'Alerta', 'Todos os campos, incluindo a foto de perfil, são obrigatórios.');
        return;
      }
  
      if (password !== password2) {
        showAlert('warning', 'Alerta', 'Senhas não conferem.');
        return;
      }
  
      if (!validateName(name)) {
        showAlert('warning', 'Alerta', 'Nome deve ter pelo menos 3 caracteres.');
        return;
      }
  
      if (!validateEmail(email)) {
        showAlert('warning', 'Alerta', 'Por favor, insira um email válido.');
        return;
      }
  
      if (!validatePassword(password)) {
        showAlert('warning', 'Alerta', 'A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      const response = await registerUser({
        name,
        email,
        password,
        profilePicture
      });
      showAlert('success', 'Sucesso', 'Cadastro realizado com sucesso!');
      
      navigation.replace('Login'); 
      
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao fazer o cadastro';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showAlert('error', 'Erro', errorMessage);
    }
  };

  return (
    <View style={styles.container3}>
      <View style={styles.container1}>
        <Image style={styles.logo} source={require('../assets/logo_branca.png')} />
        <Text style={styles.title1}>Já é um usuário ReUse?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Text style={styles.loginbutton}>Clique aqui para logar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.form}>
        
        <Text style={styles.title}>Crie sua conta, rapidinho.</Text>
        
        <Text style={styles.texte}>Digite seu Usuário</Text>
        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput value={name} onChangeText={setName} style={styles.inputText} />
        </LinearGradient>

        <Text style={styles.texte}>Digite seu melhor e-mail</Text>
        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput value={email} onChangeText={setEmail} style={styles.inputText} autoCapitalize='none' />
        </LinearGradient>

        <Text style={styles.texte}>Digite sua senha</Text>
        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput value={password} onChangeText={setPassword} style={styles.inputText} secureTextEntry />
        </LinearGradient>

        <Text style={styles.texte}>Digite sua senha novamente.</Text>
        <LinearGradient colors={['#386EA1', '#578EBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inputGradient}>
          <TextInput value={password2} onChangeText={setPassword2} style={styles.inputText} secureTextEntry />
        </LinearGradient>

        {profilePicture && <Image source={{ uri: profilePicture }} style={styles.profileImage} />}

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={selectImage} style={styles.imagePicker}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 15}}>Selecionar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.imageTaker}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 15}}>Tirar Foto</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity onPress={handleRegister} >
          <Text style={styles.registerbutton}>CRIAR CONTA</Text>
        </TouchableOpacity>

        <Text style={{ color: '#386ea1', textAlign: 'center', marginTop: 10, marginBottom: 0, fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins'}}>Ao criar uma conta, você concorda com nossos</Text>
        <TouchableOpacity onPress={() => { navigation.navigate("Termos") }} >
          <Text style={{ textDecorationLine: 'underline', color: '#386ea1', textAlign: 'center', marginTop: 0, marginBottom: 80, fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins'}}>Termos de Uso</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flex: 1,
    backgroundColor: '#FFFFFF', // Ou sua cor de fundo
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
  logo: { 
    height: 80,
    width: 80,
    resizeMode: 'contain', 
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  title1: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  container3: { flex: 1,  backgroundColor: '#386ea1' },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#386ea1',
    fontFamily: 'Poppins',
    fontWeight: 'bold'
  },
  texte: {
    color: '#386ea1',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    fontFamily: 'Poppins'
  },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, color: 'black' },
  placeholder: { color: 'black' },
  imagePicker: {
    backgroundColor: '#337ca8',
    color: 'white',
    fontFamily: 'Popins',
    fontWeight: 'bold',
    height: 80,
    padding: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
    borderColor: 'white',
    borderLeftWidth: 1

  },
  imageTaker: {
    backgroundColor: '#337ca8',
    color: 'white',
    fontFamily: 'Popins',
    fontWeight: 'bold',
    height: 80,
    width: 150,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    borderColor: 'white',
    borderLeftWidth: 1
  },
  container1: {
    flex: 0,
    justifyContent: 'center',
    padding: 80,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderTopRightRadius: 24,
    borderTopLeftRadius:  24,
    //marginBottom: 20,
    flex: 1,
    color: '',
    fontFamily: 'Poppins',
    fontWeight: 'bold',

  },
  registerbutton: {
    marginTop: 30,
    marginBottom: 20,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#386ea1',
    padding: 15,
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: 'Poppins',

  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    borderColor: '#386ea1',
    borderWidth: 2,
    marginBottom: 15,
  },
});

export default RegisterScreen;
