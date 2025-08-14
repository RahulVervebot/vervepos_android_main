import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const SingleDepartment = () => {
  const navigation = useNavigation(); // Access navigation from react-navigation
  return (
    <View style={styles.container}>
     <Text>Single Department</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

});
export default SingleDepartment;