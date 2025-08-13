import {StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import data2 from '../../APIvariables.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, IconButton } from 'react-native-paper';
import LoadingModal from '../components/LoadingModal';
import { Image } from 'react-native';
import nodata from '../images/nodata.jpg';

const TopSellingCategories = ({route, navigation}) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          color="#000"
        />
      ),
    });
  }, [navigation]);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    console.log('route.params : ', route.params);

    const getAllProducts = async () => {
      let current_access_token;
      let current_url;
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          console.log('access_token : ', access_token);
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
      var myHeaders = new Headers();
      myHeaders.append('access_token', current_access_token);
      // myHeaders.append('Cookie', 'session_id');
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };

      fetch(
        `${current_url}/api/top-selling/categories?start_date=${route.params.startDate}&end_date=${route.params.endDate}&no_of_items=${route.params.numCategories}`,
        requestOptions,
      )
        .then(response => response.text())
        .then(result => {
          // console.log(result);
          setData(JSON.parse(result));
          setLoading(false);
        })
        .catch(error => {
          console.log('error', error);
          setLoading(false);
          alert('Try Selecting a different Time frame');
          // navigation.navigate('TopSellingCategoriesDateSelect');
        });
    };
    getAllProducts();
  }, []);

  return (
    <View>
      <ScrollView style={styles.container}>
        {!loading && (
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>Start Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  {data?.start_date || route.params.startDate}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>End Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  {data?.end_date || route.params.endDate}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* <View style={{marginHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20, color: '#000'}}>Name</Text>
            <Text style={{fontSize: 20, color: '#000'}}>Amount</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20, color: '#000'}}>---------------</Text>
            <Text style={{fontSize: 20, color: '#000'}}>---------------</Text>
          </View>

          {data ? (
            data?.categories?.map((e, i) => (
              <View
                key={i}
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 20, color: '#000'}}>{e.name}</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  $ {Intl.NumberFormat('en-US').format(Math.round(e.amount))}
                </Text>
              </View>
            ))
          ) : (
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Text
                style={{fontSize: 20, color: '#000', marginVertical: '35%'}}>
                Loading...
              </Text>
            </View>
          )}

          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15, marginBottom: '2%', color: '#000'}}>
              -----------------------------------------------
            </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text style={{fontSize: 20, color: '#000'}}>End Of Report</Text>
          </View>
        </View> */}


        {data?.categories.length > 0 ? (
          <Card style={styles.card}>
            <Title style={{textAlign: 'center', fontSize: 25,fontWeight: 'bold',fontFamily:'System',marginVertical:10 }}>Product Categories</Title>
            <View style={styles.divider} />
            <View style={{flexDirection: 'row', justifyContent: 'space-between',marginHorizontal: 15}}>
              <Text style={{fontSize: 20, color: '#000'}}>Name</Text>
              <Text style={{fontSize: 20, color: '#000'}}>Amount</Text>
            </View>
             <View style={styles.divider} />
            {data?.categories && (
              <Card.Content>
                <View style={{marginHorizontal: 0}}>
                    {data && (
                      data?.categories?.map((e, i) => (
                        <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          <Text style={{fontSize: 20, color: '#000'}}>{e.name}</Text>
                          <Text style={{fontSize: 20, color: '#000'}}> $ {Intl.NumberFormat('en-US').format(Math.round(e.amount))}</Text>
                        </View>
                      ))
                    )}
                </View>
              </Card.Content>
            )}
            <View style={styles.divider} />
            <Title style={{textAlign: 'center',marginVertical:10}}>End Of Report</Title>
          </Card>
        ) : loading ? (
          <LoadingModal visible={loading} />
        ) : (
          <View>
            <Image source={nodata} style={styles.image}/>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TopSellingCategories;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: '1%',
    height: '95%',
  },
  image: {
    width: Dimensions.get('window').width,
    height: 500,
  },
  card: {
    marginHorizontal: '5%',
    marginVertical: '2%',
    borderRadius: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});
