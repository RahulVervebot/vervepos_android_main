import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card,Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AllocatedAmountModal from '../DepatmentsAccess/AllocatedAmountModal';
import RequestAmount from '../DepatmentsAccess/RequestAmount';

const VendorManagerDashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRequestVisible, setIsRequestVisible] = useState(false);
  const navigation = useNavigation();
  async function custom_Logout() {
    AsyncStorage.removeItem('ManageAccount');
    AsyncStorage.removeItem('is_pos_manager');
    await AsyncStorage.removeItem('access_token').then(() => {
      navigation.navigate('Login');
    });
    // await AsyncStorage.removeItem('access_token').then(navigation.LoginForm());
    console.log('Logging out');
  }
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Report</Text>
          </Card.Content>
        </Card>

          <Card style={styles.card} onPress={() => navigation.navigate('DepartmentPOData')}>
            <Card.Content>
              <Text variant="titleMedium">Department</Text>
            </Card.Content>
          </Card>

      </View> 
      <View style={styles.row}>
      <Card style={styles.card} onPress={() => navigation.navigate('RequestVendorBudget')} >
          <Card.Content>
            <Text variant="titleMedium">Vendor Budget Request</Text>
           {/* <RequestAmount isRequestVisible={isRequestVisible} setIsRequestVisible={setIsRequestVisible} /> */}
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => setIsModalVisible(true)} >
          <Card.Content>
            <Text variant="titleMedium">Allocated Amount</Text>
            <AllocatedAmountModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />

          </Card.Content>
        </Card>
      </View>
      <Button mode="contained" onPress={() => custom_Logout()}
>Logout</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '45%', // Ensures two cards fit per row
    padding: 10,
  },
});

export default VendorManagerDashboard;