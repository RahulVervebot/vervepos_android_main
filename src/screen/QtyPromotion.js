import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TextInput
  } from 'react-native';
  import React, {useEffect, useState} from 'react';
  import {TouchableOpacity} from 'react-native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  const QtyPromotion = ({navigation, route}) => {
    const [promotionData, setPromotionData] = useState();
    const [rerenderState,setRerenderState] = useState(false)
    const [search, setSearch] = useState('');
  
    const [index, setIndex] = useState(100);
  
    useEffect(() => {
     const  FirstRun =async() => {
      let current_url;
      let current_access_token;
      await AsyncStorage.getItem('storeUrl').then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      }).catch(error => {
        alert('some error');
      });
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          // console.log('access_token : ', access_token);
          current_access_token = access_token;
        }).catch(error => {
          alert('some error');
        });

       var myHeaders = new Headers();
      //  myHeaders.append(
      //   'Cookie',
      //   'session_id=0ceac6a14cc05178c2a851427b88ce1a9deab1cb',
      // );
      myHeaders.append(
        'access_token',
        current_access_token,
      );
   
       var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow',
         credentials: 'omit', // Ensures cookies are not sent
       };
   
       fetch(
         `${current_url}/api/promotion_products`,
         requestOptions,
       )
         .then(response => response.json())
         .then(result => {
          //  console.log(result,'result');
           result.length < 1
             ? alert('Try Again.')
             : null;
           result ? setPromotionData(result) : null;
          result ? setIndex(result.length) : null;
         })
         .catch(error => {
           console.log('error', error);
           alert('Try Again.');
           setPromotionData([]);
           navigation.navigate('Home')
         });
     }
     FirstRun()
    }, [rerenderState]);

    function isJsonString(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
    }

    const DeletePromotion = async(Id)=>{
      // console.log(Id,'Id')
      let current_url;
      let current_access_token;
      await AsyncStorage.getItem('storeUrl').then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      }).catch(error => {
        alert('some error');
      });
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          // console.log('access_token : ', access_token);
          current_access_token = access_token;
        }).catch(error => {
          alert('some error');
        });
        var myHeaders = new Headers();

        myHeaders.append('access_token', current_access_token);
        // myHeaders.append(
        //   'Cookie',
        //   'session_id=0ceac6a14cc05178c2a851427b88ce1a9deab1cb',
        // );
      var requestOptions = {
        method: 'DELETE',
        headers:myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };
      
      
      fetch(`${current_url}/api/delete/promotion?product_id=${Id}`, requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log(result)
        let jasonText =  isJsonString(result) 
        if(jasonText){
          alert(JSON.parse(result).message)
          setRerenderState(!rerenderState)
        }else{
          alert("Some error")
        }
        })
        .catch(error => console.log('error', error));
    }

    const onLoadMore = () => {
      // console.log('IndexedPaymentData', index);
      setIndex(index + 10);
    };
  
    // console.log("promotionData", promotionData);

    return (
      <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
       
         <TextInput
                style={styles.searchPromotionTextInput}
                placeholderTextColor={'#87c3ff'}
                placeholder={`SEARCH PROMOTION`}
                onChangeText={val => setSearch(val)}
              />
        <ScrollView>
          <View
            style={styles.totalPromotionsView}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: '5%',
                marginVertical: '2.5%',
              }}>
              <Text style={{fontSize: 18, fontWeight: '300', color: '#f58b40'}}>
                TOTAL PROMOTION:
              </Text>
              <Text style={{fontSize: 18, fontWeight: '300', color: '#f58b40'}}>
                {promotionData?.length ?? <ActivityIndicator />}
              </Text>
            </View>
          </View>
  
          {promotionData ? promotionData
          .filter(data => typeof data.name === 'string' && data.name.toLowerCase().includes(search.toLowerCase()))
          .map((data, index) => (
              <View
                style={styles.promotionsDetailsView}
                key={index}>
                <View
                  style={styles.PromotionTitleView}>
                  <Text style={{...styles.boxtext, color:'white',fontWeight:'bold'}}>{data?.name}</Text>
                </View>
  
                <View
                  style={{flexDirection: 'row', justifyContent: 'space-between',padding:'2%',marginTop:10}}>
                  <Text style={styles.boxtext}>NO. OF PRODUCTS : </Text>
                  <Text style={styles.boxtextData}>{ data?.no_of_products }</Text>
                </View>

                <View
                  style={{flexDirection: 'row', justifyContent: 'space-between',padding:'2%'}}>
                  <Text style={styles.boxtext}>FIX AMOUNT : </Text>
                  <Text style={styles.boxtextData}>$ { Intl.NumberFormat('en-US').format(data?.fix_amount) }</Text>
                </View>

                <View
                  style={{flexDirection: 'row', justifyContent: 'space-between',padding:'2%'}}>
                  <Text style={styles.boxtext}>START DATE : </Text>
                  <Text style={styles.boxtextData}> { data?.start_date }</Text>
                </View>

                <View
                  style={{flexDirection: 'row', justifyContent: 'space-between',padding:'2%'}}>
                  <Text style={styles.boxtext}>END DATE : </Text>
                  <Text style={styles.boxtextData}> {data?.end_date }</Text>
                </View>

                <TouchableOpacity
                  onPress={() => DeletePromotion(data.product_id)}
                  style={styles.deletePromotionBtn}>
                  <Text style={{color: '#ff0000', fontSize: 16}}> DELETE </Text>
                </TouchableOpacity>
              </View>
            ))
            : 
            (
            <View style={{marginVertical: '50%'}}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
  
          {promotionData?.length ? (
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={onLoadMore}>
                <Text style={{fontSize: 16, color: '#3399ff', fontWeight: '600'}}>
                  {promotionData?.length <= index ? 'NO MORE DATA !' : 'LOAD MORE'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  };
  
  export default QtyPromotion ;
  
  const styles = StyleSheet.create({
    boxtext: {
      fontSize: 16,
      fontWeight: '300',
    },
    boxtextData: {
      fontSize: 16,
      fontWeight: '300',color:'#00ab41'
    },
    PromotionTitleView: {
      flexDirection: 'row',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor:'#4C99D1',
      padding:10,
      borderTopStartRadius:20,
      borderTopRightRadius:20
    },
    deletePromotionBtn: {
      padding: 10,
      backgroundColor: '#fff',
      borderColor: '#ff0000',
      borderWidth: 0.2,
      width: '80%',
      alignItems: 'center',
      borderRadius: 10,
      margin: '3%',
      marginTop:'5%',
      alignSelf:'center'
    },
    loadMoreBtn: {
      alignItems: 'center',
      marginHorizontal: '10%',
      marginVertical: '20%',
      borderColor: '#3399ff',
      borderWidth: 0.5,
      padding: '3%',
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    searchPromotionTextInput: {
      borderColor: '#3399ff',
      borderWidth: 1,
      padding: '3%',
      marginBottom: '1%',
      borderRadius: 10,
      width: '90%',
      height: '7%',
      marginTop: '2%',
      fontSize: 16,
      alignSelf:'center'
    },
    totalPromotionsView: {
      backgroundColor: '#fff',
      shadowOffset: {width: 1, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 3,
      marginHorizontal: '5%',
      borderColor: '#939596',
      borderWidth: 0,
      marginVertical: '2%',
      padding: '3%',
      borderRadius: 20,
    },
    promotionsDetailsView: {
      backgroundColor: '#fff',
      shadowOffset: {width: 1, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 3,
      marginHorizontal: '5%',
      borderColor: '#939596',
      borderWidth: 0,
      marginVertical: '2%',
      // padding: '3%',
      borderRadius: 20,
    }
  });
  



