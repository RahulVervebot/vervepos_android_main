import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Linking,
  Text,
  PermissionsAndroid,
  Alert,
  Image,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
  IconButton,
  TextInput,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import nodata from '../images/nodata.jpg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
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
  const [downloadDoc, setDownloadDoc] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadItem, setDownloadItem] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  // ---- leak guards ----
  const abortControllersRef = useRef(new Set());
  const isMountedRef = useRef(true);
  const currentDownloadJobIdRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;

      // abort all in-flight fetches
      abortControllersRef.current.forEach((ctrl) => {
        try { ctrl.abort(); } catch {}
      });
      abortControllersRef.current.clear();

      // stop any in-progress RNFS download
      if (currentDownloadJobIdRef.current != null) {
        try { RNFS.stopDownload(currentDownloadJobIdRef.current); } catch {}
        currentDownloadJobIdRef.current = null;
      }
    };
  }, []);

  const safeSetState = (setter) => {
    if (isMountedRef.current) setter();
  };

  const safeFetch = async (url, options = {}) => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      abortControllersRef.current.delete(controller);
    }
  };

  useEffect(() => {
    const readFiles = async () => {
      try {
        const path =
          Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}`
            : `${RNFS.DocumentDirectoryPath}`;
        const result = await RNFS.readDir(path);
        safeSetState(() => setDownloadDoc(result.map((file) => file.name)));
      } catch (error) {
        console.error('Error reading files:', error);
      }
    };

    readFiles();
    // re-check after a download completes/changes
  }, [isDownloading]);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // WRITE permission is still required for <= Android 12; on 13+ WRITE is ignored but harmless
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED || Platform.Version >= 33; // allow 13+
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const downloadPDF = async (pdfUrl, invoiceNo) => {
    safeSetState(() => setDownloadItem(invoiceNo));
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to download PDFs.');
      return;
    }

    safeSetState(() => setIsDownloading(true));
    const fileName = `invoice_${invoiceNo}.pdf`;
    const path =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const { jobId, promise } = RNFS.downloadFile({ fromUrl: pdfUrl, toFile: path });
    currentDownloadJobIdRef.current = jobId;

    promise
      .then(() => {
        if (!isMountedRef.current) return;
        Alert.alert('Download Complete', `File saved to ${path}`);
        setIsDownloading(false);
        currentDownloadJobIdRef.current = null;
      })
      .catch((error) => {
        if (error && error.description === 'cancelled') return;
        console.error(error);
        if (isMountedRef.current) {
          Alert.alert('Download Failed', 'An error occurred while downloading.');
          setIsDownloading(false);
          currentDownloadJobIdRef.current = null;
        }
      });
  };

  const openPDF = async (filePath) => {
    try {
      await FileViewer.open(filePath, { displayName: 'Invoice', showOpenWithDialog: true });
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Failed to open PDF. No supported app found.');
    }
  };

  const sharePDF = async (path) => {
    const filePath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${path}`
        : `${RNFS.DocumentDirectoryPath}/${path}`;

    const exists = await RNFS.exists(filePath);
    if (!exists) {
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

  const onSearchPress = () => {
    const value = (searchValue || '').trim();
    if (!value) {
      Alert.alert('Enter a barcode', 'Search field cannot be empty.');
      return;
    }
    handleScanProduct(value);
  };
const normalizeBarcode = (s) =>
  String(s ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')   // zero-width
    .replace(/[\r\n\t]/g, '')                // control whitespace
    .trim();

// For matching server keys like "541\n" to "541"
const normalizeKey = (s) =>
  String(s ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')                     // remove all whitespace inside
    .trim();

  const fetchProductData = (rawBarcode) => {
      const barcode = normalizeBarcode(rawBarcode);
    return new Promise(async (resolve, reject) => {
      if (isRequestInProgress) {
        alert('A request is already in progress. Please wait.');
        reject(new Error('Request in progress'));
        return;
      }

      safeSetState(() => {
        setLoading(true);
        setIsRequestInProgress(true);
      });

      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const storeUrl = await AsyncStorage.getItem('storeUrl');

        const myHeaders = new Headers();
        myHeaders.append('access_token', accessToken);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
          credentials: 'omit',
          body: JSON.stringify({ barcode }),
        };
console.log("requestOptions: ",requestOptions);
        const response = await safeFetch(`${storeUrl}/product/barcode/search`, requestOptions);
        const result = await response.json();
        console.log('result:', result);

        if (
          result &&
          result.result &&
          result.result[barcode] &&
          result.result[barcode].VendorByBarcode
        ) {
          resolve(result.result[barcode].VendorByBarcode);
        } else {
          reject(new Error('No vendor data found'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again later.');
        reject(error);
      } finally {
        safeSetState(() => {
          setLoading(false);
          setIsRequestInProgress(false);
        });
      }
    });
  };

  const fetchAdditionalProductDetails = async (barcode) => {
    const accessToken = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    try {
      const myHeaders = new Headers();
      myHeaders.append('access_token', accessToken);
      myHeaders.append('Cookie', 'session_id');

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit',
      };

      const response = await safeFetch(
        `${storeUrl}/api/searchbybarcode/products?barcode=${barcode}`,
        requestOptions
      );
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
    safeSetState(() => setScannedBarcode(barcode));
    console.log("scaned barcode: ",barcode);
    try {
       const vendorData = await fetchProductData(barcode);
      let productDetail = await fetchAdditionalProductDetails(barcode);
      if (!productDetail && barcode.startsWith('0')) {
        productDetail = await fetchAdditionalProductDetails(barcode.substring(1));
      }
      if (!productDetail && barcode.length > 1) {
        productDetail = await fetchAdditionalProductDetails(barcode.slice(0, -1));
      }
      if (!productDetail && barcode.startsWith('0') && barcode.length > 1) {
        productDetail = await fetchAdditionalProductDetails(
          barcode.substring(1, barcode.length - 1)
        );
      }
       safeSetState(() => setData(vendorData));
       console.log("vendorData:",vendorData);

      safeSetState(() => {
        setSearchValue('');
        setProductDetails(productDetail);
      });
    } catch (error) {
      safeSetState(() => setSearchValue(''));
      console.error('Error in fetching product data:', error);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === 'Infinity' || value === 'NaN') {
      return null;
    }
    const num = Number(value);
    if (Number.isNaN(num)) return null;
    return num.toFixed(2);
  };

  const openLinkInBrowser = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const renderKV = (label, value) => (
    <View style={styles.row} key={label}>
      <Text style={[styles.k]} numberOfLines={2}>{label}</Text>
      <Text style={[styles.v]} numberOfLines={2}>{value ?? ''}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Barcode Field */}
      <TextInput
        label="Search Barcode"
        value={searchValue}
        onChangeText={setSearchValue}
        mode="outlined"
        style={styles.search}
        keyboardType="numeric"
      />

      {/* Search Button */}
      <Button mode="contained" onPress={onSearchPress} style={styles.btn}>
        Search
      </Button>

      <Button
        mode="contained"
        onPress={() =>
          navigation.navigate('BarcodeScannerWithProps', {
            onBarcodeScanned: handleScanProduct,
          })
        }
        style={styles.btn}
      >
        Scan Barcode
      </Button>

      <LoadingModal visible={loading} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {scannedBarcode && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Barcode</Text>
              <Text style={styles.value}>{scannedBarcode}</Text>
            </Card.Content>
          </Card>
        )}

        {productDetails && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Product Details</Text>
              {renderKV('POS Name', productDetails.name)}
              {renderKV('Selling Price In POS', formatValue(productDetails.list_price))}
              {renderKV('Size', productDetails.size)}
              {productDetails.barcode ? renderKV('Barcode', productDetails.barcode) : null}
            </Card.Content>
          </Card>
        )}

        {data.length > 0 &&
          data.map((item, index) => {
            const details = item.data || {};
            return (
              <Card key={`${item.vendor}-${index}`} style={styles.card}>
                <Card.Content>
                  <Text style={[styles.title, styles.bold]}>
                    Vendor: <Text style={styles.value}>{item.vendor}</Text>
                  </Text>

                  {renderKV('Invoice Description', details.invDescription || '')}
                  {renderKV('Invoice No.', details.invoiceNo || '')}
                  {renderKV('Invoice Name', details.invoiceName || '')}
                  {renderKV('Invoice Received Date', details.invoiceSavedDate || '')}
                  {renderKV('Item No. In Invoice', details.itemNo || '')}

                  {formatValue(details.invQty) !== null &&
                    renderKV('Invoice Qty Received', formatValue(details.invQty))}
                  {formatValue(details.invUnitCost) !== null &&
                    renderKV('Invoice Unit Cost', formatValue(details.invUnitCost))}
                  {formatValue(details.invCaseCost) !== null &&
                    renderKV('Invoice Case Cost', formatValue(details.invCaseCost))}
                  {formatValue(details.invExtendedPrice) !== null &&
                    renderKV('Invoice Extended Price', formatValue(details.invExtendedPrice))}
                </Card.Content>

                <View style={styles.actionsRow}>
                  {details.DownloadLink && (
                    <Card.Actions>
                      <Button
                        onPress={() => downloadPDF(details.DownloadLink, details.invoiceNo)}
                        compact
                      >
                        {downloadItem === details.invoiceNo && isDownloading
                          ? 'Downloading...'
                          : 'Download PDF'}
                      </Button>
                    </Card.Actions>
                  )}
{/* 
                  {downloadDoc?.some((val) =>
                    val.toString().includes((details.invoiceNo || '').toString())
                  ) && (
                    <Card.Actions>
                      <Button
                        onPress={() =>
                          navigation.navigate('PDFViewer', {
                            invoiceNo: details.invoiceNo,
                          })
                        }
                        compact
                      >
                        View PDF
                      </Button>
                    </Card.Actions>
                  )} */}
                </View>
              </Card>
            );
          })}

        {!loading && data.length === 0 && (
          <View style={styles.noDataWrap}>
            <Image source={nodata} style={styles.image} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default IcmsInvenotryReport;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: { marginBottom: 10 },
  btn: { marginBottom: 14 },
  scroll: { marginTop: 8 },
  scrollContent: { paddingBottom: 32 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  bold: { fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 12,
  },
  k: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  v: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // prevents overflow on small screens
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  noDataWrap: { alignItems: 'center', justifyContent: 'center' },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.6, // keeps it responsive on mobile/tablet
    resizeMode: 'contain',
  },
});
