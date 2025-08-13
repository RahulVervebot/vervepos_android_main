import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import {useNavigation} from '@react-navigation/native';

const FloatingAddButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}  onPress={() =>
              navigation.navigate('AddProduct')}>
        <Text style={styles.text}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    bottom: Platform.OS === 'android' ? 16:50,
    right: Platform.OS === 'android' ? 16:25,
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  text: {
    color: 'white',
    fontSize: 38,
    fontWeight: '500',
    
  },
});

export default FloatingAddButton;


