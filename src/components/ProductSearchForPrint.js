import {View, Text, Modal, TouchableOpacity,ActivityIndicator, StyleSheet, Image,RefreshControl, FlatList,Alert} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native';
const ICON_SIZE = 50;
const BORDER_SIZE = 0;
const numColumns = 2;

const ProductSearchForPrint = ({
  openModel,
  setOpenModel,
  manualWord,
  setManualWord,
  setSelectedModelProduct,
}) => {
  const [loadModel, setLoadModel] = useState(true);
  const flatListRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [loading_page, setLoading_page] = useState(false);
  const [isMoreLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchOffset, setSearchOffset] = useState(1);
  const [categ_id_for_url, setCateg_id_for_url] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetData = async () => {
      let currentURL;
      let AccessToken;
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          currentURL = storeUrl;
          // console.log(storeUrl);
        })
        .catch(error => {
          alert('some error');
        });

      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          // console.log('access_token : ', access_token);
          AccessToken = access_token;
        })
        .catch(error => {
          alert('some error');
        });
      var myHeaders = new Headers();
      myHeaders.append('access_token', AccessToken);
      // myHeaders.append('Cookie', 'session_id');
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };
      // console.log('all data fpr api', currentURL, requestOptions);
      fetch(
        `${currentURL}/api/search/products?keyword=${manualWord}&pagesize=${pageSize}&page_no=${searchOffset}${categ_id_for_url}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(data => {
          // console.log('datafrom call search', data);
          setPageSize(prev => prev + 10);
          setDataSource(data.items);
          setLoading_page(false);
          setLoading(false);
          setLoadModel(false)
          setManualWord('');
        })
        .catch(error => {
          console.log('error', error);
          setLoading_page(false);
        });
    };
    fetData();

    return () => {
      // console.log('unmounted');
      setLoading_page(false);
      setLoading(false);
      setLoadModel(false);
      setManualWord('');
    };
  }, []);

  const First_Api_Request = async () => {
    let currentURL;
    let AccessToken;
    await AsyncStorage.getItem('storeUrl')
      .then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        currentURL = storeUrl;
      })
      .catch(error => {
        alert('some error');
      });

    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        AccessToken = access_token;
      })
      .catch(error => {
        alert('some error');
      });
    var myHeaders = new Headers();
    myHeaders.append('access_token', AccessToken);
    // myHeaders.append('Cookie', 'session_id');
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit', // Ensures cookies are not sent
    };
    setLoading_page(true);
    fetch(
      `${currentURL}/api/search/products?pagesize=${pageSize}&page_no=${offset}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(data => {
        // console.log('Data in refesh loading', data);
        setPageSize(prev => prev + 10);
        setDataSource(data.items);
        setLoading_page(false);
        setIsLoading;
        false;
      })
      .catch(error => {
        console.log('error', error);
        alert('Some Problem in API, Please try later.');
        setIsLoading(false);
        setLoading_page(false);
      });
  };

  const loadMore = () => {
    setIsLoading(true);
    if (manualWord?.length < 1) {
      First_Api_Request();
    }
  };
  const handlePressCloseButton = () => {
    setOpenModel(false);
  };

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={loadMore}
          style={styles.loadMoreBtn}>
          {isMoreLoading ? (
            <View style={styles.indicatorContainer}>
              <ActivityIndicator
                size="small"
                color="green"
                style={{marginLeft: -8, padding: '3%', marginBottom: '10%'}}
              />
            </View>
          ) : (
            <Text style={styles.btnText}>LOAD MORE</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  function debounce(func, delay) {
    let timerId;

    return function (args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        // console.log('deboun : ', args);
        func(args);
      }, delay);
    };
  }

  const RenderItem = ({item}) => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              setSelectedModelProduct(item);
              setOpenModel(false);
            }}>
            <View style={styles.priceContainer}></View>
            <View style={{alignItems: 'center'}}>
              <Image
                style={styles.logo}
                source={
                  item.image_128
                    ? {uri: `data:image/png;base64,${item.image_128}`}
                    : require('../.././src/images/NO_IMAGE1.png')
                }
                resizeMode="contain"
              />
            </View>

            <Text style={styles.txtName}>{item.name}</Text>
            <Text style={styles.txtBarcode}>{item.barcode}</Text>
            <Text style={styles.txtPrice}>$ {item.list_price.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  return (
    <View>
      <Modal
        animationType="slide" // Options: 'slide', 'fade', 'none'
        transparent={false} // Background transparency
        visible={openModel}
        onRequestClose={() => setOpenModel(false)} // Handles back button press on Android
      >
        <View style={[styles.modelHeader]}>
          <View style={{marginLeft: 20}}>
            <Text style={styles.modelTitle}>Select Product</Text>
          </View>
          <View style={{marginRight: 20}}>
            <CloseButton
              style={styles.closeTop}
              onPress={handlePressCloseButton}>
              <Text style={styles.txtcloseTop}>❌</Text>
            </CloseButton>
          </View>
        </View>

        {loadModel ? (
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          </View>
        ) : (
          <>
            {/* {console.log('data for flatelist', dataSource)} */}
            {dataSource.length==0 ? (
                <View style={{display:'flex',justifyContent:'center'}}>
                    <Text style={{textAlign:'center',alignItems:'center',marginVertical:40}}>No Data Found </Text>
                </View>
            ) :
            <FlatList
              ref={flatListRef}
              style={styles.flatlistContainer}
              data={dataSource}
              renderItem={({item}) => <RenderItem item={item} />}
              numColumns={numColumns}
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.5}
              keyExtractor={(item, index) => item.id}
              enableEmptySections={true}
              refreshControl={
                <RefreshControl
                  refreshing={loading_page}
                  onRefresh={() => {
                    setPageSize(10);
                    setDataSource([]);
                    function refresh() {
                      First_Api_Request();
                    }
                    let debouce_refresh = debounce(refresh, 100);
                    debouce_refresh();
                  }}
                />
              }
            />}
          </>
        )}
      </Modal>
    </View>
  );
};

export default ProductSearchForPrint;

const CloseButton = styled.TouchableOpacity`
  background-color: white;
  width: ${ICON_SIZE + BORDER_SIZE}px;
  height: ${ICON_SIZE + BORDER_SIZE}px;
  border-radius: ${(ICON_SIZE + BORDER_SIZE) / 2}px;
  border-width: ${BORDER_SIZE}px;
  marginbottom: 50px;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marker: {
    borderRadius: 20,
    borderWidth: 3,
  },
  cameraContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  torch: {
    position: 'absolute',
    marginTop: 60,
    zIndex: 1,
    right: 15,
    top: -40,
  },
  close: {
    marginTop: -60,
    alignSelf: 'center',
    margin: 20,
  },
  flash: {
    height: 25,
    width: 30,
    tintColor: '#fff',
  },
  txtclose: {
    color: 'red',
    padding: 15,
    textAlign: 'center',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'gray',
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  modelTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  closeTop: {
    margin: 0,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  txtcloseTop: {
    color: 'red',
    padding: 15,
    textAlign: 'center',
  },

  ///////
  flatlistContainer: {
    marginTop: 10,
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '45%',
    margin: 10,
    marginTop: 5,
    justifyContent: 'space-evenly',
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    width: '100%',
    shadowColor: '#000',
    elevation: 2,
    borderColor: '#000',
    borderWidth: 0.3,
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: 5,
    borderRadius: 10,
  },
  productContainer: {
    flex: 1,
  },
  txtName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
  },

  txtBarcode: {
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 5,
    color: 'black',
  },
  txtPrice: {
    color: '#0572b5',
    fontWeight: '800',
    textAlign: 'center',
    margin: '2%',
  },

  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Platform.OS === 'android' ? 0 : 15,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#1E90FF',
    padding: '3%',
    borderRadius: 20,
    marginBottom: '10%',
  },
});


// import {View, Text, Modal, TouchableOpacity,ActivityIndicator, StyleSheet, Image,RefreshControl, FlatList,Alert} from 'react-native';
// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import styled from 'styled-components';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SafeAreaView } from 'react-native';
// const ICON_SIZE = 50;
// const BORDER_SIZE = 0;
// const numColumns = 2;

// const ProductSearchForPrint = ({
//   openModel,
//   setOpenModel,
//   manualWord,
//   setManualWord,
//   setSelectedModelProduct,
// }) => {
//   const [loadModel, setLoadModel] = useState(true);
//   const flatListRef = useRef(null);
//   const [dataSource, setDataSource] = useState([]);
//   const [loading_page, setLoading_page] = useState(false);
//   const [isMoreLoading, setIsLoading] = useState(false);
//   const [offset, setOffset] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchOffset, setSearchOffset] = useState(1);
//   const [categ_id_for_url, setCateg_id_for_url] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetData = async () => {
//       let currentURL;
//       let AccessToken;
//       await AsyncStorage.getItem('storeUrl')
//         .then(storeUrl => {
//           currentURL = storeUrl;
//           console.log(storeUrl);
//         })
//         .catch(error => {
//           alert('some error');
//         });

//       await AsyncStorage.getItem('access_token')
//         .then(access_token => {
//           console.log('access_token : ', access_token);
//           AccessToken = access_token;
//         })
//         .catch(error => {
//           alert('some error');
//         });
//       var myHeaders = new Headers();
//       myHeaders.append('access_token', AccessToken);
//       myHeaders.append('Cookie', 'session_id');
//       var requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow',
//         credentials: 'omit', // Ensures cookies are not sent
//       };
//       console.log('all data fpr api', currentURL, requestOptions);
//       fetch(
//         `${currentURL}/api/search/products?keyword=${manualWord}&pagesize=${pageSize}&page_no=${searchOffset}${categ_id_for_url}`,
//         requestOptions,
//       )
//         .then(response => response.json())
//         .then(data => {
//           console.log('datafrom call search', data);
//           setPageSize(prev => prev + 10);
//           setDataSource(data.items);
//           setLoading_page(false);
//           setLoading(false);
//           setLoadModel(false)
//           setManualWord('');
//         })
//         .catch(error => {
//           console.log('error', error);
//           setLoading_page(false);
//         });
//     };
//     fetData();

//     return () => {
//       console.log('unmounted');
//       setLoading_page(false);
//       setLoading(false);
//       setLoadModel(false);
//       setManualWord('');
//     };
//   }, []);

//   const First_Api_Request = async () => {
//     let currentURL;
//     let AccessToken;
//     await AsyncStorage.getItem('storeUrl')
//       .then(storeUrl => {
//         console.log('storeUrl : ', storeUrl);
//         currentURL = storeUrl;
//       })
//       .catch(error => {
//         alert('some error');
//       });

//     await AsyncStorage.getItem('access_token')
//       .then(access_token => {
//         console.log('access_token : ', access_token);
//         AccessToken = access_token;
//       })
//       .catch(error => {
//         alert('some error');
//       });
//     var myHeaders = new Headers();
//     myHeaders.append('access_token', AccessToken);
//     myHeaders.append('Cookie', 'session_id');
//     var requestOptions = {
//       method: 'GET',
//       headers: myHeaders,
//       redirect: 'follow',
//       credentials: 'omit', // Ensures cookies are not sent
//     };
//     setLoading_page(true);
//     fetch(
//       `${currentURL}/api/search/products?pagesize=${pageSize}&page_no=${offset}`,
//       requestOptions,
//     )
//       .then(response => response.json())
//       .then(data => {
//         console.log('Data in refesh loading', data);
//         setPageSize(prev => prev + 10);
//         setDataSource(data.items);
//         setLoading_page(false);
//         setIsLoading;
//         false;
//       })
//       .catch(error => {
//         console.log('error', error);
//         alert('Some Problem in API, Please try later.');
//         setIsLoading(false);
//         setLoading_page(false);
//       });
//   };

//   const loadMore = () => {
//     setIsLoading(true);
//     if (manualWord?.length < 1) {
//       First_Api_Request();
//     }
//   };
//   const handlePressCloseButton = () => {
//     setOpenModel(false);
//   };

//   const renderFooter = () => {
//     return (
//       <View style={styles.footer}>
//         <TouchableOpacity
//           activeOpacity={0.9}
//           onPress={loadMore}
//           style={styles.loadMoreBtn}>
//           {isMoreLoading ? (
//             <View style={styles.indicatorContainer}>
//               <ActivityIndicator
//                 size="small"
//                 color="green"
//                 style={{marginLeft: -8, padding: '3%', marginBottom: '10%'}}
//               />
//             </View>
//           ) : (
//             <Text style={styles.btnText}>LOAD MORE</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   function debounce(func, delay) {
//     let timerId;

//     return function (args) {
//       clearTimeout(timerId);
//       timerId = setTimeout(() => {
//         console.log('deboun : ', args);
//         func(args);
//       }, delay);
//     };
//   }

//   const RenderItem = ({item}) => {
//     return (
//       <SafeAreaView style={styles.mainContainer}>
//         <View style={styles.container}>
//           <TouchableOpacity
//             onPress={() => {
//               setSelectedModelProduct(item);
//               setOpenModel(false);
//             }}>
//             <View style={styles.priceContainer}></View>
//             <View style={{alignItems: 'center'}}>
//               <Image
//                 style={styles.logo}
//                 source={
//                   item.image_128
//                     ? {uri: `data:image/png;base64,${item.image_128}`}
//                     : require('../.././src/images/NO_IMAGE1.png')
//                 }
//                 resizeMode="contain"
//               />
//             </View>

//             <Text style={styles.txtName}>{item.name}</Text>
//             <Text style={styles.txtBarcode}>{item.barcode}</Text>
//             <Text style={styles.txtPrice}>$ {item.list_price.toFixed(2)}</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   };
//   return (
//     <View>
//       <Modal
//         animationType="slide" // Options: 'slide', 'fade', 'none'
//         transparent={false} // Background transparency
//         visible={openModel}
//         onRequestClose={() => setOpenModel(false)} // Handles back button press on Android
//       >
//         <View style={[styles.modelHeader]}>
//           <View style={{marginLeft: 20}}>
//             <Text style={styles.modelTitle}>Select Product</Text>
//           </View>
//           <View style={{marginRight: 20}}>
//             <CloseButton
//               style={styles.closeTop}
//               onPress={handlePressCloseButton}>
//               <Text style={styles.txtcloseTop}>❌</Text>
//             </CloseButton>
//           </View>
//         </View>

//         {loadModel ? (
//           <View style={styles.modalBackground}>
//             <View style={styles.activityIndicatorWrapper}>
//               <ActivityIndicator size="large" color="#0000ff" />
//             </View>
//           </View>
//         ) : (
//           <>
//             {/* {console.log('data for flatelist', dataSource)} */}
//             {dataSource.length==0 ? (
//                 <View style={{display:'flex',justifyContent:'center'}}>
//                     <Text style={{textAlign:'center',alignItems:'center',marginVertical:40}}>No Data Found </Text>
//                 </View>
//             ) :
//             <FlatList
//               ref={flatListRef}
//               style={styles.flatlistContainer}
//               data={dataSource}
//               renderItem={({item}) => <RenderItem item={item} />}
//               numColumns={numColumns}
//               ListFooterComponent={renderFooter}
//               onEndReachedThreshold={0.5}
//               keyExtractor={(item, index) => item.id}
//               enableEmptySections={true}
//               refreshControl={
//                 <RefreshControl
//                   refreshing={loading_page}
//                   onRefresh={() => {
//                     setPageSize(10);
//                     setDataSource([]);
//                     function refresh() {
//                       First_Api_Request();
//                     }
//                     let debouce_refresh = debounce(refresh, 100);
//                     debouce_refresh();
//                   }}
//                 />
//               }
//             />}
//           </>
//         )}
//       </Modal>
//     </View>
//   );
// };

// export default ProductSearchForPrint;

// const CloseButton = styled.TouchableOpacity`
//   background-color: white;
//   width: ${ICON_SIZE + BORDER_SIZE}px;
//   height: ${ICON_SIZE + BORDER_SIZE}px;
//   border-radius: ${(ICON_SIZE + BORDER_SIZE) / 2}px;
//   border-width: ${BORDER_SIZE}px;
//   marginbottom: 50px;
// `;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   marker: {
//     borderRadius: 20,
//     borderWidth: 3,
//   },
//   cameraContainer: {
//     flex: 1,
//     height: '100%',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   torch: {
//     position: 'absolute',
//     marginTop: 60,
//     zIndex: 1,
//     right: 15,
//     top: -40,
//   },
//   close: {
//     marginTop: -60,
//     alignSelf: 'center',
//     margin: 20,
//   },
//   flash: {
//     height: 25,
//     width: 30,
//     tintColor: '#fff',
//   },
//   txtclose: {
//     color: 'red',
//     padding: 15,
//     textAlign: 'center',
//   },
//   modelHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // marginHorizontal: 2,
//     // marginVertical: 5,
//     backgroundColor: 'gray',
//   },
//   modelTitle: {
//     fontSize: 20,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   closeTop: {
//     margin: 0,
//     borderWidth: 1,
//     borderColor: '#fff',
//     backgroundColor: '#fff',
//   },
//   txtcloseTop: {
//     color: 'red',
//     padding: 15,
//     textAlign: 'center',
//   },

//   ///////
//   flatlistContainer: {
//     marginTop: 10,
//   },
//   mainContainer: {
//     display: 'flex',
//     flexDirection: 'row',
//     width: '45%',
//     margin: 10,
//     marginTop: 5,
//     justifyContent: 'space-evenly',
//   },

//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 10,
//     width: '100%',
//     shadowColor: '#000',
//     elevation: 2,
//     borderColor: '#000',
//     borderWidth: 0.3,
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     marginTop: 5,
//     borderRadius: 10,
//   },
//   productContainer: {
//     flex: 1,
//   },
//   txtName: {
//     textAlign: 'center',
//     fontWeight: 'bold',
//     marginTop: 10,
//     color: 'black',
//   },

//   txtBarcode: {
//     textAlign: 'center',
//     fontWeight: '400',
//     marginTop: 5,
//     color: 'black',
//   },
//   txtPrice: {
//     color: '#0572b5',
//     fontWeight: '800',
//     textAlign: 'center',
//     margin: '2%',
//   },

//   modalBackground: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   activityIndicatorWrapper: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   footer: {
//     padding: 5,
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginBottom: Platform.OS === 'android' ? 0 : 15,
//   },
//   loadMoreBtn: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   indicatorContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   btnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '500',
//     textAlign: 'center',
//     backgroundColor: '#1E90FF',
//     padding: '3%',
//     borderRadius: 20,
//     marginBottom: '10%',
//   },
// });
