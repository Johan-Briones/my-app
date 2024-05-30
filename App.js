import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Para ícono de menú

import MainScreen from "./screens/MainScreen";
import UpdateScreen from "./screens/UpdateScreen";
import DeleteScreen from "./screens/DeleteScreen";
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CustomDrawerContent from './screens/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const [projectName, setProjectName] = useState('');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <MaterialIcons name="menu" size={24} color="black" style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        ),
        headerTitle: "SpeqtrumPicture",
        headerTitleStyle: { 
          flex: 1, 
          textAlign: 'center', 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#003366', // color más oscuro
          marginBottom: 0, // menos margen inferior
          fontStyle: 'italic', // cursiva
        },
        headerTitleAlign: 'center',
      })}
    >
      <Drawer.Screen name="Main">
        {props => <MainScreen {...props} setProjectName={setProjectName} />}
      </Drawer.Screen>
      <Drawer.Screen name="Update">
        {props => <UpdateScreen {...props} projectName={projectName} />}
      </Drawer.Screen>
      <Drawer.Screen name="Delete" component={DeleteScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
