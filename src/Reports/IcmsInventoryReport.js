import React, { useEffect, useState } from 'react';
import { View, ScrollView, Linking, Text,PermissionsAndroid,Alert, Image, Dimensions, StyleSheet } from 'react-native'; // Import Text from react-native
import { Button, Card, Subheading, IconButton,TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import nodata from '../images/nodata.jpg';
import RNFS from 'react-native-fs'; // File System
import Share from 'react-native-share'; // For Sharing
import FileViewer from 'react-native-file-viewer';

const IcmsInvenotryReport = ({ navigation }) => {
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [downloadDoc,setDownloadDoc] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadItem,setDownloadItem] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const readFiles = async () => {
      try {
       // Change to the desired directory
        const path =
          Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}`
            : `${RNFS.DocumentDirectoryPath}`;
        const result = await RNFS.readDir(path); // Get file list
        setDownloadDoc(result.map(file => file.name)); // Extract file names
      } catch (error) {
        console.error('Error reading files:', error);
      }
    };

    readFiles();
  }, [isDownloading]);


  const checkPermission = async () => {
     if (Platform.OS === 'android') {
       try {
         const granted = await PermissionsAndroid.request(
           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
         );
         return granted === PermissionsAndroid.RESULTS.GRANTED;
       } catch (err) {
         console.warn(err);
         return false;
       }
     }
     return true;
  };

  const downloadPDF = async (pdfUrl,invoiceNo) => {
    setDownloadItem(invoiceNo);
    // console.log('Downloading PDF:', pdfUrl);
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download PDFs.',
      );
      return;
    }

    setIsDownloading(true);
    const fileName = `invoice_${invoiceNo}.pdf`;
    // Set download path (Android: Downloads folder, iOS: Document Directory)
    const path =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    RNFS.downloadFile({
      fromUrl: pdfUrl,
      toFile: path,
    })
      .promise.then(() => {
        Alert.alert('Download Complete', `File saved to ${path}`);
        // console.log('Download Complete:', path);
        setIsDownloading(false);
        // if(path){sharePDF(path)}
        // openPDF(path); // Open after downloading
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Download Failed', 'An error occurred while downloading.');
        setIsDownloading(false);
      });
  };

  // Function to Open PDF
  const openPDF = async (filePath) => {
    // console.log('Opening PDF:', filePath);
    try {
      await FileViewer.open(filePath, {
        displayName: 'Invoice',
        showOpenWithDialog: true,
      });
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Failed to open PDF. No supported app found.');
      // sharePDF()
    }
  };

  // Function to Share PDF
  const sharePDF = async (path) => {
    const fileName = path;
    const filePath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    if (!(await RNFS.exists(path))) {
      Alert.alert('Error', 'PDF not found. Please download it first.');
      return;
    }

    try {
      const options = {
        url: `file://${filePath}`,
        type: 'application/pdf',
        title: 'Share Invoice PDF',
        failOnCancel: false,
      };
      await Share.open(options);
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF.');
    }
  };


  const fetchProductData = (barcode) => {
    return new Promise(async (resolve, reject) => {
      if (isRequestInProgress) {
        alert('A request is already in progress. Please wait.');
        reject(new Error('Request in progress'));
        return;
      }

      setLoading(true);
      setIsRequestInProgress(true);

      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const storeUrl = await AsyncStorage.getItem('storeUrl');

        const myHeaders = new Headers();
        myHeaders.append('access_token', accessToken);
        myHeaders.append('Content-Type', 'application/json');
        // myHeaders.append('Cookie', 'session_id');

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
          credentials: 'omit',
          body: JSON.stringify({ barcode: barcode }),
        };

        const response = await fetch(`${storeUrl}/product/barcode/search`, requestOptions);
        const result = await response.json();

        if (result && result.result && result.result[barcode] && result.result[barcode].VendorByBarcode) {
          resolve(result.result[barcode].VendorByBarcode);
        } else {
          reject(new Error('No vendor data found'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again later.');
        reject(error);
      } finally {
        setLoading(false);
        setIsRequestInProgress(false);
      }
    });
  };

  const fetchAdditionalProductDetails = async (barcode) => {
    const accessToken = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    try {

      var myHeaders = new Headers();

      myHeaders.append('access_token', accessToken);
      myHeaders.append(
        'Cookie',
        'session_id',
      );
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };

      const response = await fetch(`${storeUrl}/api/searchbybarcode/products?barcode=${barcode}`, requestOptions);
      const result = await response.json();

      if (result && result.items && result.items.length > 0) {
        return result.items[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching additional product details:', error);
      return null;
    }
  };

  const handleScanProduct = async (barcode) => {
    // console.log("Scanned barcode:", barcode);
    setScannedBarcode(barcode);

    try {
      const vendorData = await fetchProductData(barcode);
      setData(vendorData);

      let productDetail = await fetchAdditionalProductDetails(barcode);
      if (!productDetail && barcode.startsWith('0')) {
        // Remove first digit if it's '0'
        productDetail = await fetchAdditionalProductDetails(barcode.substring(1));
      }
      if (!productDetail && barcode.length > 1) {
        // Remove last digit
        productDetail = await fetchAdditionalProductDetails(barcode.slice(0, -1));
      }
      if (!productDetail && barcode.startsWith('0') && barcode.length > 1) {
        // Remove first and last digit
        productDetail = await fetchAdditionalProductDetails(barcode.substring(1, barcode.length - 1));
      }
      setSearchValue('');
      setProductDetails(productDetail);
    } catch (error) {
      setSearchValue('')
      console.error('Error in fetching product data:', error);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "Infinity" || value === "NaN") {
      return null;
    }
    return parseFloat(value).toFixed(2);
  };

  const openLinkInBrowser = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
            {/* Search Barcode Field */}
      <TextInput
        label="Search Barcode"
        value={searchValue}
        onChangeText={setSearchValue}
        mode="outlined"
        style={{ marginBottom: 10 }}
        keyboardType="numeric"
      />

      {/* Search Button - directly calls handleScanProduct */}
      <Button
        mode="contained"
        onPress={() => handleScanProduct(searchValue)}
        style={{ marginBottom: 20 }}
      >
        Search
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('BarcodeScannerWithProps', { onBarcodeScanned: handleScanProduct })}
        style={{ marginBottom: 20 }}
      >
        Scan Barcode
      </Button>
      <LoadingModal visible={loading} />

      <ScrollView style={{ marginTop: 20 }}>
        {scannedBarcode && (
          <Card style={{ marginBottom: 10 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold' }}>Barcode: {scannedBarcode}</Text>
            </Card.Content>
          </Card>
        )}

        {productDetails && (
          <Card style={{ marginBottom: 10 }}>
            <Card.Content>
              <Subheading>POS Name: {productDetails.name}</Subheading>
              <Subheading>Selling Price In POS: {formatValue(productDetails.list_price)}</Subheading>
              <Subheading>Size: {productDetails.size}</Subheading>
              {productDetails.barcode && <Subheading>Barcode: {productDetails.barcode}</Subheading>}
            </Card.Content>
          </Card>
        )}

        {data.length > 0 && data.map((item, index) => {
          const details = item.data;
          return (
            <Card key={index} style={{ marginBottom: 10 }}>
              <Card.Content>
                <Subheading style={{ fontWeight: 'bold' }}>Vendor Name: {item.vendor}</Subheading>
                {details.invDescription ? <Subheading>Invoice Description: {details.invDescription}</Subheading> : <Subheading>Invoice Description: </Subheading>}
                {details.invoiceNo ? <Subheading>Invoice No.: {details.invoiceNo}</Subheading> : <Subheading>Invoice No.: </Subheading>}
                {details.invoiceName ? <Subheading>Invoice Name: {details.invoiceName}</Subheading> : <Subheading>Invoice Name: </Subheading>}
                {details.invoiceSavedDate ? <Subheading>Invoice Received Date: {details.invoiceSavedDate}</Subheading> :  <Subheading>Invoice Received Date: </Subheading>}
                {details.itemNo ?  <Subheading>Item No. In Invoice: {details.itemNo}</Subheading> : <Subheading>Item No. In Invoice: </Subheading>}
                {formatValue(details.invQty) !== null && <Subheading>Invoice Qty Received: {formatValue(details.invQty)}</Subheading>}
                {formatValue(details.invUnitCost) !== null && <Subheading>Invoice Unit Cost: {formatValue(details.invUnitCost)}</Subheading>}
                {formatValue(details.invCaseCost) !== null && <Subheading>Invoice Case Cost: {formatValue(details.invCaseCost)}</Subheading>}
                {formatValue(details.invExtendedPrice) !== null && <Subheading>Invoice Extended Price: {formatValue(details.invExtendedPrice)}</Subheading>}
              </Card.Content>
              <View style={{display:'flex',flexDirection:'row-reverse',justifyContent:'space-between'}}>
              {details.DownloadLink && (
                <Card.Actions>
                  <Button onPress={() => downloadPDF(details.DownloadLink,details.invoiceNo)}>
                     {((downloadItem==details.invoiceNo) && isDownloading ) ? "Downloading ...." :"Download PDF"}
                  </Button>
                </Card.Actions>
              )}
             
              {(downloadDoc?.filter(val=>((val).toString()).includes((details.invoiceNo).toString())).length>0) && (
                <Card.Actions>
                  <Button onPress={() => navigation.navigate('PDFViewer',{invoiceNo:details.invoiceNo})}>
                     View PDF
                  </Button>
                </Card.Actions>
              )}
              </View>
              
            </Card>
          );
        })}

        {(!loading && data.length === 0 && scannedBarcode) && (
          <View>
              <Image source={nodata} style={styles.image}/>
           </View>
        )}
      </ScrollView>
    </View>
  );
};

export default IcmsInvenotryReport;

const styles = StyleSheet.create({
    image:{
      width:Dimensions.get('window').width,
      height:300
    }
})


// import React, { useState } from 'react';
// import { View, ScrollView, Linking, Text } from 'react-native'; // Import Text from react-native
// import { Button, Card, Subheading } from 'react-native-paper';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LoadingModal from '../components/LoadingModal';

// const IcmsInvenotryReport = ({ navigation }) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isRequestInProgress, setIsRequestInProgress] = useState(false);
//   const [scannedBarcode, setScannedBarcode] = useState(null);
//   const [productDetails, setProductDetails] = useState(null);

//   const fetchProductData = (barcode) => {
//     return new Promise(async (resolve, reject) => {
//       if (isRequestInProgress) {
//         alert('A request is already in progress. Please wait.');
//         reject(new Error('Request in progress'));
//         return;
//       }

//       setLoading(true);
//       setIsRequestInProgress(true);

//       try {
//         const accessToken = await AsyncStorage.getItem('access_token');
//         const storeUrl = await AsyncStorage.getItem('storeUrl');

//         const myHeaders = new Headers();
//         myHeaders.append('access_token', accessToken);
//         myHeaders.append('Content-Type', 'application/json');
//         myHeaders.append('Cookie', 'session_id');

//         const requestOptions = {
//           method: 'POST',
//           headers: myHeaders,
//           redirect: 'follow',
//           credentials: 'omit',
//           body: JSON.stringify({ barcode: barcode }),
//         };

//         const response = await fetch(`${storeUrl}/product/barcode/search`, requestOptions);
//         const result = await response.json();

//         if (result && result.result && result.result[barcode] && result.result[barcode].VendorByBarcode) {
//           resolve(result.result[barcode].VendorByBarcode);
//         } else {
//           reject(new Error('No vendor data found'));
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         alert('Failed to fetch data. Please try again later.');
//         reject(error);
//       } finally {
//         setLoading(false);
//         setIsRequestInProgress(false);
//       }
//     });
//   };

//   const fetchAdditionalProductDetails = async (barcode) => {
//     const accessToken = await AsyncStorage.getItem('access_token');
//     const storeUrl = await AsyncStorage.getItem('storeUrl');

//     try {

//       var myHeaders = new Headers();

//       myHeaders.append('access_token', accessToken);
//       myHeaders.append(
//         'Cookie',
//         'session_id',
//       );
//       var requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow',
//         credentials: 'omit', // Ensures cookies are not sent
//       };

//       const response = await fetch(`${storeUrl}/api/searchbybarcode/products?barcode=${barcode}`, requestOptions);
//       const result = await response.json();

//       if (result && result.items && result.items.length > 0) {
//         return result.items[0];
//       } else {
//         return null;
//       }
//     } catch (error) {
//       console.error('Error fetching additional product details:', error);
//       return null;
//     }
//   };

//   const handleScanProduct = async (barcode) => {
//     console.log("Scanned barcode:", barcode);
//     setScannedBarcode(barcode);

//     try {
//       const vendorData = await fetchProductData(barcode);
//       setData(vendorData);

//       let productDetail = await fetchAdditionalProductDetails(barcode);
//       if (!productDetail && barcode.startsWith('0')) {
//         // Remove first digit if it's '0'
//         productDetail = await fetchAdditionalProductDetails(barcode.substring(1));
//       }
//       if (!productDetail && barcode.length > 1) {
//         // Remove last digit
//         productDetail = await fetchAdditionalProductDetails(barcode.slice(0, -1));
//       }
//       if (!productDetail && barcode.startsWith('0') && barcode.length > 1) {
//         // Remove first and last digit
//         productDetail = await fetchAdditionalProductDetails(barcode.substring(1, barcode.length - 1));
//       }
//       setProductDetails(productDetail);
//     } catch (error) {
//       console.error('Error in fetching product data:', error);
//     }
//   };

//   const formatValue = (value) => {
//     if (value === null || value === undefined || value === "Infinity" || value === "NaN") {
//       return null;
//     }
//     return parseFloat(value).toFixed(2);
//   };

//   const openLinkInBrowser = (url) => {
//     Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
//   };

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Button
//         mode="contained"
//         onPress={() => navigation.navigate('BarcodeScannerWithProps', { onBarcodeScanned: handleScanProduct })}
//         style={{ marginBottom: 20 }}
//       >
//         Scan Barcode
//       </Button>
//       <LoadingModal visible={loading} />

//       <ScrollView style={{ marginTop: 20 }}>
//         {scannedBarcode && (
//           <Card style={{ marginBottom: 10 }}>
//             <Card.Content>
//               <Text style={{ fontWeight: 'bold' }}>Barcode: {scannedBarcode}</Text>
//             </Card.Content>
//           </Card>
//         )}

//         {productDetails && (
//           <Card style={{ marginBottom: 10 }}>
//             <Card.Content>
//               <Subheading>POS Name: {productDetails.name}</Subheading>
//               <Subheading>Selling Price In POS: {formatValue(productDetails.list_price)}</Subheading>
//               <Subheading>Size: {productDetails.size}</Subheading>
//               {productDetails.barcode && <Subheading>Barcode: {productDetails.barcode}</Subheading>}
//             </Card.Content>
//           </Card>
//         )}

//         {data.length > 0 && data.map((item, index) => {
//           const details = item.data;
//           return (
//             <Card key={index} style={{ marginBottom: 10 }}>
//               <Card.Content>
//                 <Subheading style={{ fontWeight: 'bold' }}>Vendor Name: {item.vendor}</Subheading>
//                 {details.invDescription && <Subheading>Invoice Description: {details.invDescription}</Subheading>}
//                 {details.invoiceNo && <Subheading>Invoice No.: {details.invoiceNo}</Subheading>}
//                 {details.invoiceName && <Subheading>Invoice Name: {details.invoiceName}</Subheading>}
//                 {details.invoiceSavedDate && <Subheading>Invoice Received Date: {details.invoiceSavedDate}</Subheading>}
//                 {details.itemNo && <Subheading>Item No. In Invoice: {details.itemNo}</Subheading>}
//                 {formatValue(details.invQty) !== null && <Subheading>Invoice Qty Received: {formatValue(details.invQty)}</Subheading>}
//                 {formatValue(details.invUnitCost) !== null && <Subheading>Invoice Unit Cost: {formatValue(details.invUnitCost)}</Subheading>}
//                 {formatValue(details.invCaseCost) !== null && <Subheading>Invoice Case Cost: {formatValue(details.invCaseCost)}</Subheading>}
//                 {formatValue(details.invExtendedPrice) !== null && <Subheading>Invoice Extended Price: {formatValue(details.invExtendedPrice)}</Subheading>}
//               </Card.Content>
//               {details.DownloadLink && (
//                 <Card.Actions>
//                   <Button onPress={() => openLinkInBrowser(details.DownloadLink)}>
//                     Download PDF
//                   </Button>
//                 </Card.Actions>
//               )}
//             </Card>
//           );
//         })}
//       </ScrollView>
//     </View>
//   );
// };

// export default IcmsInvenotryReport;
