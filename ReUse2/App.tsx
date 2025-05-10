import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { AlertProvider } from './context/AlertContext';
enableScreens(true);

// Telas
import Login from './pages/loginScreen';

import Register from './pages/registroScreen';
import Home from './pages/homeScreen';
import Termos from './pages/termos'
import Profile from './pages/ProfileScreen'
import Product from './pages/ProductScreen'
import ProductDetail from './pages/ProductDetailScreen';
import ReceivedProposalsScreen from './pages/ReceivedProposalsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Termos: undefined;
  Profile: undefined;
  Product: undefined;
  ProductDetail: {productId: number};
  ReceivedProposalsScreen: undefined;

};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AlertProvider>
      <SafeAreaProvider> {/* Adicione este wrapper */}
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/** Remover a headerbar  **/}
            <Stack.Screen name="Login" options={{ headerShown: false }} component={Login} />
            <Stack.Screen name="Register" options={{ headerShown: false }} component={Register} />
            <Stack.Screen name="Termos" options={{ headerShown: true }} component={Termos} />
            <Stack.Screen name="Home" options={{ headerShown: false }} component={Home} />
            <Stack.Screen name="Profile" options={{ headerShown: false }} component={Profile} />
            <Stack.Screen name="Product" options={{ headerShown: false }} component={Product} />
            <Stack.Screen name="ProductDetail" options={{ headerShown: false }} component={ProductDetail} />
            <Stack.Screen name="ReceivedProposalsScreen" options={{ headerShown: true, title: 'Propostas Recebidas' }} component={ReceivedProposalsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AlertProvider>
  );
};

export default App;