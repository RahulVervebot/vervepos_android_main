// src/accountant/ManagerDashboard.js

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { 
  fetchAsyncValuesAndCheckStatusForDashboard, 
  fetchManagerDataForDashboard, 
  handleManagerSelect 
} from '../functions/VendorAccess/function'; // Import functions from function.js

const AccountDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);
  const [data, setData] = useState([]);

  // Call the function to fetch Async values and check status
  useEffect(() => {
    fetchAsyncValuesAndCheckStatusForDashboard(setAccessToken, setStoreUrl, fetchManagerDataForDashboard, setData, setLoading, navigation);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Fetching Manager Data...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        {data.length > 0 ? (
          data.map((manager, index) => (
            <Card
              key={index}
              style={{ marginVertical: 10 }}
              onPress={() => handleManagerSelect(manager, navigation)} // Handle card press with handleManagerSelect function
            >
              <Card.Content>
                <Text variant="titleMedium">{manager.name}</Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text>No Manager Data Available</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default AccountDashboard;
