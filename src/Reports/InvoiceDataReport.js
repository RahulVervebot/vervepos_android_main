import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  Dimensions,
  Text,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import { DateTime, IANAZone } from 'luxon';
import nodata from '../images/nodata.jpg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';
import {
  IconButton,
} from 'react-native-paper';
// Reusable period selector WITHOUT react-native-paper (with Custom support)
import SelectPeriodButtonRN from '../components/SelectPeriodButtonRN';

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
      headerTitle: 'Invoice Data Report',
    });
  }, [navigation]);

  const colorScheme = useColorScheme();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [startDate, setStartDate] = useState(null); // 'yyyy-MM-dd HH:mm:ss'
  const [endDate, setEndDate] = useState(null);
  const [selectedPeriodName, setSelectedPeriodName] = useState('');
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

  // Same offsets table
  const ZONE_OFFSETS = {
    'America/New_York': -4,
    'America/Chicago': -5,
    'America/Denver': -6,
    'America/Phoenix': -7,
    'America/Los_Angeles': -7,
    'America/Anchorage': -8,
    'America/Adak': -9,
    'Pacific/Honolulu': -10,
    'Pacific/Pago_Pago': -11,
    'America/Indiana/Indianapolis': -4,
    'Asia/Kolkata': 5.5,
    'Europe/London': 1,
    'UTC': 0
  };
  // ==== INIT: set timezone + default today range ====
  useEffect(() => {
    const init = async () => {
      try {
       const [token, url, maybeZone] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('storeUrl'),
          AsyncStorage.getItem('tz'),
        ]);
        setAccessToken(token || '');
        setStoreUrl(url || '');
        
      
        const aliasResolved = ZONE_ALIASES[maybeZone] ?? maybeZone;
        const safeZone = IANAZone.isValidZone(aliasResolved) ? aliasResolved : 'America/New_York';
        setTimezone(safeZone);

        const offset = ZONE_OFFSETS[safeZone] ?? 0;
        const now = DateTime.utc().plus({ hours: offset });

        const start = now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
        const end = now.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');

        setStartDate(start);
        setEndDate(end);
        setSelectedPeriodName('Today');
      } catch (err) {
        console.log('Init tz/dates error', err);
      }
    };
    init();
  }, []);

  // read files (for "View PDF/Excel" conditional buttons)
  useEffect(() => {
    const readFiles = async () => {
      try {
        const path =
          Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}`
            : `${RNFS.DocumentDirectoryPath}`;
        const result = await RNFS.readDir(path);
        setDownloadDoc(result.map((f) => f.name));
      } catch (e) {
        console.error('Error reading files:', e);
      }
    };
    readFiles();
  }, [isDownloading, isDownloadingExcel]);

  // ====== Permissions + Download helpers ======
  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
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
    // const hasPermission = await checkPermission();
    // if (!hasPermission)
    //   return Alert.alert(
    //     'Permission Denied',
    //     'Storage permission is required to download PDFs.'
    //   );
    console.log("inv no", invoiceNo);
    console.log("pdfUrl", pdfUrl);
    setIsDownloading(true);
    const safeInvoiceNo = invoiceNo.replace(/\//g, '_');
    const fileName = `invoice_${safeInvoiceNo}.pdf`;
    const path =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    RNFS.downloadFile({ fromUrl: pdfUrl, toFile: path }).promise
      .then(() => {
        Alert.alert('Download Complete', `File saved to ${path}`);
      })
      .catch(() =>
        Alert.alert('Download Failed', 'An error occurred while downloading.')
      )
      .finally(() => setIsDownloading(false));
  };

  const downloadExcel = async (excelUrl, invoiceNo) => {
    setIsDownloadingExcel(true);
    setDownloadItemExc(invoiceNo);
    // const hasPermission = await checkPermission();
    // if (!hasPermission)
    //   return Alert.alert(
    //     'Permission Denied',
    //     'Storage permission is required to download files.'
    //   );
    const safeInvoiceNo = invoiceNo.replace(/\//g, '_');
    const fileName = `invoice_${safeInvoiceNo}.xlsx`;
    const path =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    RNFS.downloadFile({ fromUrl: excelUrl, toFile: path }).promise
      .then(() => Alert.alert('Download Complete', `File saved to ${path}`))
      .catch(() =>
        Alert.alert('Download Failed', 'An error occurred while downloading.')
      )
      .finally(() => setIsDownloadingExcel(false));
  };

  const openPDF = async (filePath) => {
    try {
      await FileViewer.open(filePath, {
        displayName: 'Invoice',
        showOpenWithDialog: true,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open PDF. No supported app found.');
    }
  };

  const sharePDF = async (fileName) => {
    const filePath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;
    if (!(await RNFS.exists(filePath)))
      return Alert.alert('Error', 'PDF not found. Please download it first.');
    try {
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        title: 'Share Invoice PDF',
        failOnCancel: false,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF.');
    }
  };

  // ====== API ======
 // ====== API ======
  const fetchProductData = async () => {
    if (isRequestInProgress)
      return alert('A request is already in progress. Please wait.');
    if (!startDate || !endDate)
      return alert('Please select both start and end dates.');

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
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      };
     console.log("requestOptions:",requestOptions);
      const response = await fetch(
        `${storeUrl}/api/invoice_data_report`,
        requestOptions
      );
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
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
    } catch (e) {
      console.error('Error fetching data:', e);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  };
  // filters
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.InvoiceName.toLowerCase().includes(
          invoiceNameFilter.toLowerCase()
        ) &&
        item.SavedInvoiceNo.toLowerCase().includes(
          invoiceNumberFilter.toLowerCase()
        )
    );
    setFilteredData(filtered);
  }, [invoiceNameFilter, invoiceNumberFilter, data]);

  const ButtonPrimary = ({ title, onPress, style }) => (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
const safeInvoiceNo = (s) => (s ?? '').toString().replace(/\//g, '_');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* ===== Period selector ===== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <SelectPeriodButtonRN
          buttonText="Select Period"
          onChange={({ label, startDate, endDate, timezone: tz }) => {
            // startDate & endDate are guaranteed 'yyyy-MM-dd HH:mm:ss'
            setSelectedPeriodName(label);
            setTimezone(tz);
            setStartDate(startDate);
            setEndDate(endDate);
          }}
        />

      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
        {selectedPeriodName ? (
          <Text style={[styles.periodText]}>
            {selectedPeriodName}
          </Text>
        ) : null}
      </View>
      {startDate && endDate && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[{ fontSize: 16, marginBottom: 5 }]}>
              From
            </Text>
            <View style={[styles.dateBox, colorScheme === 'dark' && { borderColor: 'white' }]}>
              <Text style={[styles.dateText,]}>
                {startDate?.split(' ')[0]}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[{ fontSize: 16, marginBottom: 5 }]}>
              To
            </Text>
            <View style={[styles.dateBox, colorScheme === 'dark' && { borderColor: 'white' }]}>
              <Text style={[styles.dateText]}>
                {endDate?.split(' ')[0]}
              </Text>
            </View>
          </View>
        </View>
      )}
      <ButtonPrimary
        title={loading ? 'Fetching Data...' : 'Fetch Latest Data'}
        onPress={fetchProductData}
        style={styles.fetchButton}
      />
      {data.length > 0 && (
        <>
          <TextInput
            placeholder="Filter by Invoice Name"
            value={invoiceNameFilter}
            onChangeText={setInvoiceNameFilter}
            style={styles.filterInput}
          />
          <TextInput
            placeholder="Filter by Invoice Number"
            value={invoiceNumberFilter}
            onChangeText={setInvoiceNumberFilter}
            style={styles.filterInput}
          />
        </>
      )}

      <LoadingModal visible={loading} />

      <ScrollView style={{ marginTop: 20 }}>
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>
                Invoice Name: {item.InvoiceName}
              </Text>
              <Text>Invoice Number: {item.SavedInvoiceNo}</Text>
              <Text>Saved Date: {item.SavedDate}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {downloadDoc?.filter(
                  (val) =>
                    val.toString().includes(safeInvoiceNo(item.SavedInvoiceNo)) &&
                    val.toString().includes('.pdf')
                ).length > 0 ? (
                  <ButtonPrimary
                    title="View PDF File"
                    onPress={() =>
                      navigation.navigate('PDFViewer', {
                        invoiceNo: safeInvoiceNo(item.SavedInvoiceNo),
                      })
                    }
                  />
                ) : (
                  <ButtonPrimary
                    title={
                      isDownloading && downloadItem === item.SavedInvoiceNo
                        ? 'Downloading ...'
                        : 'Download PDF'
                    }
                    onPress={() =>
                      downloadPDF(item.DownloadLink, item.SavedInvoiceNo)
                    }
                  />
                )}

                {item.ExcelDownloadLink &&
                  (downloadDoc?.filter(
                    (val) =>
                      val
                        .toString()
                        .includes(safeInvoiceNo(item.SavedInvoiceNo)) &&
                      val.toString().includes('.xlsx')
                  ).length > 0 ? (
                    <ButtonPrimary
                      title="View Excel File"
                      onPress={() =>
                        navigation.navigate('ExcelView', {
                          invoiceNo: safeInvoiceNo(item.SavedInvoiceNo),
                        })
                      }
                    />
                  ) : (
                    <ButtonPrimary
                      title={
                        isDownloadingExcel &&
                          downloadItemExc === item.SavedInvoiceNo
                          ? 'Downloading ...'
                          : 'Download Excel'
                      }
                      onPress={() =>
                        downloadExcel(
                          item.ExcelDownloadLink,
                          item.SavedInvoiceNo
                        )
                      }
                    />
                  ))}
              </View>
            </View>
          ))
        ) : loading ? (
          <LoadingModal loading={loading} />
        ) : (
          <View>
            <Image source={nodata} style={styles.image} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default InvoiceDataReport;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#7E81FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  fetchButton: { marginVertical: 10, alignSelf: "center", backgroundColor: "#563C9E" },
  filterInput: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  image: { width: Dimensions.get('window').width, height: 400 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
});
