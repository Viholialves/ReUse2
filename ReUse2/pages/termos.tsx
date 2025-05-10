import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { ScrollView } from 'react-native-gesture-handler';

type TermosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Termos'>;

interface TermosScreem {
  navigation: TermosScreenNavigationProp;
}


const TermosScreem: React.FC<TermosScreem> = ({ navigation }) => {

  return (
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Termos de Uso{"\n"}</Text>
          <Text style={styles.text}>
            <Text style={{ fontWeight: 'bold' }}>
              1. Introdução Bem-vindo ao ReUse. Ao utilizar nossos serviços, você concorda com estes Termos de Uso. Caso não concorde, não utilize o Aplicativo.{"\n"}{"\n"}
              2. Uso do Aplicativo{"\n"}
            </Text>
                2.1. O Aplicativo é destinado para Troca de itens entre os usuarios.{"\n"}
                2.2. Você é responsável pelo uso adequado do Aplicativo e deve seguir todas as leis aplicáveis.{"\n"}
                2.3. É proibido o uso do Aplicativo para fins ilícitos, fraudulentos ou que violem direitos de terceiros.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              3. Cadastro e Conta{"\n"}
            </Text>
                3.1. Para acessar determinados recursos, pode ser necessário criar uma conta.{"\n"}
                3.2. Você deve fornecer informações verdadeiras e mantê-las atualizadas.{"\n"}
                3.3. A segurança da conta é de sua responsabilidade, e qualquer atividade realizada com suas credenciais será considerada de sua autoria.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              4. Privacidade e Dados{"\n"}
            </Text>
                4.1. Os dados coletados serão tratados conforme nossa Política de Privacidade.{"\n"}
                4.2. O usuário concorda com a coleta e uso de dados para melhoria dos serviços.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              5. Propriedade Intelectual{"\n"}
            </Text>
                5.1. Todo o conteúdo do Aplicativo, incluindo textos, imagens e marcas, é protegido por direitos autorais e de propriedade intelectual.{"\n"}
                5.2. O usuário não pode copiar, modificar ou distribuir qualquer parte do Aplicativo sem autorização.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              6. Limitação de Responsabilidade{"\n"}
            </Text>
                6.1. O Aplicativo é oferecido "como está" e não garantimos que estará sempre disponível ou livre de erros.{"\n"}
                6.2. Não nos responsabilizamos por danos diretos ou indiretos resultantes do uso do Aplicativo.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              7. Rescisão{"\n"}
            </Text>
                7.1. Podemos suspender ou encerrar seu acesso ao Aplicativo caso viole estes Termos.{"\n"}
                7.2. Você pode excluir sua conta a qualquer momento.{"\n"}{"\n"}
            <Text style={{ fontWeight: 'bold' }}>
              8. Alterações nos Termos{"\n"}
            </Text>
                8.1. Podemos modificar estes Termos a qualquer momento, e o uso contínuo do Aplicativo indica sua aceitação das mudanças.{"\n"}
            <Text style={{ fontWeight: 'bold' }}>{"\n"}{"\n"}
              9. Contato Se tiver dúvidas, entre em contato pelo e-mail suporte@reuse.com.{"\n"}{"\n"}{"\n"}{"\n"}
            </Text>
            Última atualização: 21/03/2025{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}
          </Text>
        </ScrollView>
      );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  text: { fontSize: 16, color: 'black', marginBottom: 5 },
});

export default TermosScreem;
