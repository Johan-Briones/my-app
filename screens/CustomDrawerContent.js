// CustomDrawerContent.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../utils/FireBase';
import { doc, getDoc } from 'firebase/firestore';

const CustomDrawerContent = (props) => {
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const email = auth.currentUser.email;
        const name = email.split('@')[0];
        setFirstName(name);

        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.isAdmin ? 'Admin' : 'User');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      props.navigation.navigate('Login');
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.userInfo}>
        <Text style={styles.userText}>{firstName}</Text>
        <Text style={styles.userText}>{userType}</Text>
      </View>
      <DrawerItemList {...props} />
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
