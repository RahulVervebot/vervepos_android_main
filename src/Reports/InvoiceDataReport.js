import React, { useState, useEffect } from 'react';
import { View, ScrollView, Linking, StyleSheet, useColorScheme, TouchableOpacity, Alert, PermissionsAndroid, Platform, Image, Dimensions } from 'react-native';
import { Button, Card, Text, TextInput, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime, IANAZone } from 'luxon';
import nodata from '../images/nodata.jpg';

import RNFS from 'react-native-fs'; // File System
import Share from 'react-native-share'; // For Sharing
import FileViewer from 'react-native-file-viewer';

const InvoiceDataReport = ({ navigation }) => {
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
  
  const colorScheme = useColorScheme(); // This will return either 'light' or 'dark'
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  const [accessToken, setAccessToken] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [invoiceNameFilter, setInvoiceNameFilter] = useState('');
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState('');

  const [downloadDoc, setDownloadDoc] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [downloadItem, setDownloadItem] = useState(null);
  const [downloadItemExc, setDownloadItemExc] = useState(null);

  // React Native DateTimePicker New Version States
  const ZONE_ALIASES = {
    'US/Eastern': 'America/New_York',
    'US/Central': 'America/Chicago',
    'US/Mountain': 'America/Denver',
    'US/Arizona': 'America/Phoenix',
    'US/Pacific': 'America/Los_Angeles',
    'US/Alaska': 'America/Anchorage',
    'US/Aleutian': 'America/Adak',
    'US/Hawaii': 'Pacific/Honolulu',
    'US/Samoa': 'Pacific/Pago_Pago',
    'US/East-Indiana': 'America/Indiana/Indianapolis'
  };

  const [startDateValue, setStartDateValue] = useState(new Date());
  const [endDateValue, setEndDateValue] = useState(new Date());
  // State for Date Picker For Promotion Ends. 

  // Start & End Date Picker States Starts.
  const handleNewStartDateConfirm = (event, selectedDate) => {
    const starttimeStampValueKey = event.nativeEvent.timestamp;
    const finalstartdate = convertTimestampToZoneForStartDate(starttimeStampValueKey);
  };

  const convertTimestampToZoneForStartDate = (ms) => {
    const myStartDateTime = DateTime.fromMillis(ms, { zone: timezone }).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(myStartDateTime, 'myStartDateTime');
    setStartDate(myStartDateTime);
    return myStartDateTime;
  };

  const handleNewEndDateConfirm = (event, selectedDate) => {
    const endtimeStampValueKey = event.nativeEvent.timestamp;
    const finalenddate = convertTimestampToZoneForEndDate(endtimeStampValueKey);
  };

  const convertTimestampToZoneForEndDate = (ms) => {
    const myEndDateTime = DateTime.fromMillis(ms, { zone: timezone }).endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(myEndDateTime, 'myEndDateTime');
    setEndDate(myEndDateTime);
    return myEndDateTime;
  };
  // Start & End Date Picker States Ends

   // Fetch the timezone from AsyncStorage and set it to state
   useEffect(() => {

    const FetchAsyncValueInAwait = async () => {
      try {

        // 1️⃣ get the Zone from AsyncStorage (or use a default value)
        const maybeZone = (await AsyncStorage.getItem('tz')) || 'America/New_York';

        // 2️⃣ translate alias → IANA if needed
        const zone = ZONE_ALIASES[maybeZone] ?? maybeZone;

        // 3️⃣ guard against truly invalid zones
        if (!IANAZone.isValidZone(zone)) {
          console.warn(`"${zone}" is not a valid IANA zone, falling back to UTC.`);
          zone = 'America/New_York';
        }

        setTimezone(zone);

      } catch (error) {
        console.log('Error in Getting Cost Price Validation Field', error);
      }
    };

    FetchAsyncValueInAwait();

    let timestampStart = DateTime.fromMillis(Date.now(), { zone: timezone }).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    let timestampEnd = DateTime.fromMillis(Date.now(), { zone: timezone }).endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    setStartDate(timestampStart);
    setEndDate(timestampEnd);

  }, []);

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
  }, [isDownloading,isDownloadingExcel]);

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

  const downloadPDF = async (pdfUrl, invoiceNo) => {
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


  const downloadExcel = async (pdfUrl, invoiceNo) => {
    setIsDownloadingExcel(true)
    setDownloadItemExc(invoiceNo);
    // console.log('Downloading excel:', pdfUrl);
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download PDFs.',
      );
      return;
    }
    const fileName = `invoice_${invoiceNo}.xlsx`;
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
        setIsDownloadingExcel(false);
        // if(path){sharePDF(path)}
        // openPDF(path); // Open after downloading
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Download Failed', 'An error occurred while downloading.');
        setIsDownloadingExcel(false);
      });
  };

  // Function to Open PDF
  const openPDF = async filePath => {
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
  const sharePDF = async path => {
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


  useEffect(() => {
    const initialize = async () => {
      try {
        const [token, url, tz] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('storeUrl')
        ]);

        setAccessToken(token);
        setStoreUrl(url);
      } catch (error) {
        alert('Error fetching initial data');
      }
    };

    initialize();
  }, []);

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const handleStartDateConfirm = (date) => {
    const formattedDate = formatDateTime(date, '00:00:00');
    setStartDate(formattedDate);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);
  const handleEndDateConfirm = (date) => {
    const formattedDate = formatDateTime(date, '23:59:59');
    setEndDate(formattedDate);
    hideEndDatePicker();
  };

  const formatDateTime = (date, time) => {
    const luxonDateTime = DateTime.fromJSDate(new Date(date), { zone: timezone });
    console.log('luxonDateTime:', luxonDateTime.toISO());
    return `${luxonDateTime.toISO().split('T')[0]} ${time}`;
  };

  const openLinkInBrowser = (url) => {
    // console.log('Opening URL:', url);
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  const fetchProductData = async () => {
    if (isRequestInProgress) {
      alert('A request is already in progress. Please wait.');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    setIsRequestInProgress(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append('access_token', accessToken);
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Cookie', 'session_id');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit',
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
        })
      };

      const response = await fetch(`${storeUrl}/api/invoice_data_report`, requestOptions);
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result && Array.isArray(result.result)) {
          setData(result.result);
          setFilteredData(result.result);
        } else {
          alert('Failed to fetch valid data.');
        }
      } else {
        const text = await response.text();
        console.error('Response was not JSON:', text);
        alert('Failed to fetch data. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [invoiceNameFilter, invoiceNumberFilter, data]);

  const filterData = () => {
    const filtered = data.filter(item => {
      return (
        item.InvoiceName.toLowerCase().includes(invoiceNameFilter.toLowerCase()) &&
        item.SavedInvoiceNo.toLowerCase().includes(invoiceNumberFilter.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',   // push them apart
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          {/* start‑date picker */}
          <DateTimePicker
            value={startDateValue ? new Date(startDateValue) : new Date()}
            mode="date"
            style={{ width: '48%' }}            // each takes ~½ of the row
            onChange={(event, date) => {
              if (event.type === 'set') handleNewStartDateConfirm(event, date);
            }}
          />

          {/* end‑date picker */}
          <DateTimePicker
            value={endDateValue ? new Date(endDateValue) : new Date()}
            mode="date"
            style={{ width: '48%' }}            // same width as first one
            onChange={(event, date) => {
              if (event.type === 'set') handleNewEndDateConfirm(event, date);
            }}
          />
        </View>

        <Button mode="contained" onPress={fetchProductData} disabled={loading} style={styles.fetchButton}>
          {loading ? 'Fetching Data...' : 'Fetch Latest Data'}
        </Button>

        {data.length > 0 && (
          <>
            <TextInput
              label="Filter by Invoice Name"
              value={invoiceNameFilter}
              onChangeText={setInvoiceNameFilter}
              style={styles.filterInput}
            />
            <TextInput
              label="Filter by Invoice Number"
              value={invoiceNumberFilter}
              onChangeText={setInvoiceNumberFilter}
              style={styles.filterInput}
            />
          </>
        )}
      </>

      <LoadingModal visible={loading} />

      <ScrollView style={{ marginTop: 20 }}>
        {(filteredData.length>0) ? filteredData.map((item, index) => (
          <Card key={index} style={{ marginBottom: 10 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold' }}>Invoice Name: {item.InvoiceName}</Text>
              <Text>Invoice Number: {item.SavedInvoiceNo}</Text>
              <Text>Saved Date: {item.SavedDate}</Text>
            </Card.Content>
            <Card.Actions>
              {(downloadDoc?.filter(val=>(((val).toString()).includes((item.SavedInvoiceNo).toString())) && (val.toString().includes(".pdf"))).length>0)  ? 
              (<Button onPress={() => navigation.navigate('PDFViewer',{invoiceNo:item.SavedInvoiceNo})}>
                  View PDF File
                </Button>) :
              (<Button onPress={() => downloadPDF(item.DownloadLink,item.SavedInvoiceNo)}>
                {(isDownloading && downloadItem==item.SavedInvoiceNo) ? "Downloading ..." : "Download PDF"}
              </Button>)}
              {item.ExcelDownloadLink && (
                (downloadDoc?.filter(val=>(((val).toString()).includes((item.SavedInvoiceNo).toString())) && (val.toString().includes(".xlsx")) ).length>0)  ? 
                (<Button onPress={() => navigation.navigate('ExcelView',{invoiceNo:item.SavedInvoiceNo})}>
                    View Excel File
                  </Button>) :
                (<Button onPress={() => downloadExcel(item.ExcelDownloadLink,item.SavedInvoiceNo)}>
                  {(isDownloadingExcel && downloadItemExc==item.SavedInvoiceNo) ? "Downloading ..." :"Download Excel"}
                </Button>)
              )}
            </Card.Actions>
          </Card>
        )):
        (loading ? <LoadingModal loading={loading}/> : <View>
         <Image source={nodata} style={styles.image}/>
        </View>)}
      </ScrollView>
      
    </View>
  );
};

export default InvoiceDataReport;

const styles = StyleSheet.create({
  dateInput: {
    marginBottom: 15,
  },
  fetchButton: {
    marginVertical: 10,
  },
  filterInput: {
    marginBottom: 15,
  },
  image: {
      width: Dimensions.get('window').width,
      height: 400,
    },
});
