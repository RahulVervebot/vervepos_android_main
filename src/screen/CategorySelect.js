import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategorySelect = () => {
  const [data, setData] = useState([]);
  let current_url;
  let current_access_token;

  var myHeaders = new Headers();
  myHeaders.append('access_token', current_access_token);
  // myHeaders.append(
  //   'Cookie',
  //   'session_id=f880ae38acf08ad1a040b669b466d75fc3a2bbd7',
  // );
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    credentials: 'omit', // Ensures cookies are not sent
  };

  async function firstRun() {
    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
      });
    await AsyncStorage.getItem('storeUrl')
      .then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      })
      .catch(error => {
        alert('some error');
      });
    fetch(`${current_url}/api/categories`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log(result, 'result');
        setData(result);
      })
      .catch(error => {
        alert('Some Problem Fetching Category');
        console.log('error', error);
      });
  }
  useEffect(() => {
    firstRun();
  }, []);

  return (
    <View>
      <View
      
      >
        {data?.map((e) => (
          <View
          key={e.id}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            marginHorizontal: '5%',
            borderColor: '#939596',
            borderWidth: 1,
            marginVertical: '0%',
            padding: '3%',
            borderRadius: 20,
            borderColor: 'rgba(126, 129, 255, 0.5)',
          }}
          >
            <Text style={{color: '#000'}}>{e.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategorySelect;

const styles = StyleSheet.create({});
