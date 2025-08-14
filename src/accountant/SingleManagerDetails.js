import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SingleManagerDetails = () => {
  const navigation = useNavigation();
  const [newbudgettype, setNewbudgetType] = useState('');

  useEffect(() => {
    const fetchbudgettype = async () => {
      const budgettype = await AsyncStorage.getItem('budget_type');
      console.log('budgettype', budgettype);
      setNewbudgetType(budgettype);
    };
    fetchbudgettype();
  }, []);

  console.log('budgettype', newbudgettype);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Card 1 with conditional navigation */}
        <Card
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              newbudgettype === 'vendor' ? 'VendorManagerRequest' : 'VendorManagerRequest'
            )
          }>
          <Card.Content>
            <Text variant="titleMedium">Requests For Budget</Text>
          </Card.Content>
        </Card>

        {/* Card 2 */}
        <Card
          style={styles.card}
          onPress={() => navigation.navigate(
             newbudgettype === 'vendor' ? 'VendorBudgetCurrentWeek' : 'VendorBudgetCurrentWeek'
          )}>
          <Card.Content>
            <Text variant="titleMedium">Current Week Budget</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.row}>
        {/* Card 3 */}
        <Card style={styles.card} onPress={() => navigation.navigate('OrderReport')}>
          <Card.Content>
            <Text variant="titleMedium">Vendor PO Report</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card} onPress={() => navigation.navigate('POTopSheetAccount')}>
          <Card.Content>
            <Text variant="titleMedium">Top PO Report</Text>
          </Card.Content>
        </Card>
      </View>
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

export default SingleManagerDetails;
