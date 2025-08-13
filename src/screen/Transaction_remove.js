import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import Dropdown from './Dropdown';

const Transaction = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedCashier, setSelectedCashier] = useState(null);

  let data = [
    {id: 1, name: 'Last Transaction'},
    {id: 2, name: 'yesterday'},
    {id: 3, name: 'lask weak'},
    {id: 4, name: 'weak1'},
    {id: 5, name: 'weak2'},
    {id: 6, name: 'weak3'},
  ];

  let Lable1 = 'Transaction:';
  let Lable2 = 'Tender:';
  let Lable3 = 'Cashier:';

  const onSelectTransaction = item => {
    setSelectedItem(item);
  };
  const onSelectTender = item => {
    setSelectedTender(item);
  };
  const onSelectCashier = item => {
    setSelectedCashier(item);
  };

  return (
    <View>
      <Dropdown
        data={data}
        onSelect={onSelectTransaction}
        value={selectedItem}
        Lable={Lable1}
      />
      <Dropdown
        data={data}
        onSelect={onSelectTender}
        value={selectedTender}
        Lable={Lable2}
      />
      <Dropdown
        data={data}
        onSelect={onSelectCashier}
        value={selectedCashier}
        Lable={Lable3}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={{fontSize: 20, color: '#000', marginLeft: 20}}>
          Amount:
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            width: '55%',
            marginTop: '4%',
          }}>
          <TextInput placeholder="From" style={styles.datebox}></TextInput>
          <TextInput placeholder="To" style={styles.datebox}></TextInput>
        </View>
      </View>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: '#02a390',
            marginTop: '8%',
            width: '50%',
            padding: '3.5%',
            alignItems: 'center',
            borderRadius: 8,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 20, color: '#fff'}}>View Transaction</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Transaction;

const styles = StyleSheet.create({
  datebox: {
    padding: '1%',
    width: '45%',
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    color: '#000',
    fontSize: 20,
  },
});
