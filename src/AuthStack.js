import React from 'react';
import { StyleSheet } from 'react-native';
import LoginForm from './screen/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator();
const AuthStack = ({ navigation }) => {
  //console.log('AuthStack ============= ');
  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginForm}
          options={{
            headerShown: true,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    color: 'white',
  },
  text: {
    fontSize: 30,
    color: 'white',
    marginTop: 70,
    textAlign: 'center',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default AuthStack;
