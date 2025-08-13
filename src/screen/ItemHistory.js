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
import imagesPath from '../constants/imagesPath';

const ItemHistory = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  let data = [
    {id: 1, name: 'Today'},
    {id: 2, name: 'yesterday'},
    {id: 3, name: 'lask weak'},
    {id: 4, name: 'lask weak1'},
    {id: 5, name: 'lask weak2'},
    {id: 6, name: 'lask weak3'},
  ];

  let Lable = 'Select Period:'

  const onSelect = item => {
    setSelectedItem(item);
  };
  return (
    <View>
      <Dropdown data={data} onSelect={onSelect} value={selectedItem} Lable ={Lable} />

      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <TextInput style={styles.datebox}></TextInput>
        <TextInput style={styles.datebox}></TextInput>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          backgroundColor: '#02a390',
          marginHorizontal: '4%',
          marginTop: '4%',
          padding: '3.5%',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <View style={{flexDirection: 'row'}}>
          <Image
            style={{marginHorizontal: '2%'}}
            source={imagesPath.CameraIcon}
          />
          <Text style={{fontSize: 20, color: '#fff'}}>Scan Item</Text>
        </View>
      </TouchableOpacity>

      <View style={{alignItems: 'center'}}>
        <TextInput
          placeholderTextColor="grey"
          placeholder="Type SKU"
          style={styles.InputDate}></TextInput>
        <TextInput
          placeholderTextColor="grey"
          placeholder="Search By Item Name"
          style={styles.InputDate}></TextInput>
      </View>
    </View>
  );
};

export default ItemHistory;
const styles = StyleSheet.create({
  datebox: {
    padding: '2%',
    width: '40%',
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    color: '#000',
    fontSize: 20,
  },
  InputDate: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    padding: '2%',
    width: '85%',
    marginTop: '8%',
    fontSize: 20,
  },
});
