import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore} from '../utils/FireBase'; // Asegúrate de que la ruta sea correcta

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
  
    if (isAdmin && adminCode !== 'Speqtrum-key@123') {
      Alert.alert('Error', 'Código de administrador incorrecto.');
      return;
    }
  
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userDoc = {
          email: user.email,
          isAdmin: isAdmin,
        };
        
        try {
          await setDoc(doc(firestore, "users", user.uid), userDoc);
          Alert.alert('Registro exitoso', `Bienvenido, ${email}`);
          navigation.navigate('Login');
        } catch (error) {
          Alert.alert('Error', 'Error al guardar los datos del usuario en Firestore: ' + error.message);
        }
      })
      .catch((error) => {
        Alert.alert('Error de registro', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <CheckBox
        title="Registrarse como administrador"
        checked={isAdmin}
        onPress={() => setIsAdmin(!isAdmin)}
      />
      {isAdmin && (
        <TextInput
          style={styles.input}
          placeholder="Código de administrador"
          value={adminCode}
          onChangeText={setAdminCode}
          secureTextEntry
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes una cuenta? Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkText: {
    color: '#007BFF',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
