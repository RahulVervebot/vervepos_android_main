/* IcmsProductStallReport.js */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  BackHandler,
  Text,
  Platform
} from 'react-native';
import {
  Button,
  TextInput,
  Card,
  Title,
  Paragraph,
  Divider,
  IconButton
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../components/LoadingModal';
import debounce from 'lodash.debounce';               //  npm i lodash.debounce

/* how many cards per page */
const ITEMS_PER_PAGE = 800;

const IcmsProductStallReport = ({route, navigation}) => {
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
  /* ---------------- core state ---------------- */
  const [data, setData] = useState(null);             // raw data from API
  const [loading, setLoading] = useState(false);
  const [inFlight, setInFlight] = useState(false);

  /* filters typed by the user */
  const [filter, setFilter] = useState({ name: '', barcode: '' });
  /* debounced copy that actually drives the filtering */
  const [debouncedFilter, setDebouncedFilter] = useState(filter);

  /* pagination */
  const [page, setPage] = useState(0);
  const scrollRef = useRef(null);

  /* =============== disable HW back while fetch is running =============== */
  useFocusEffect(
    useCallback(() => {
      const onBack = () => inFlight;
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [inFlight]),
  );

  /* =============== fetch report =============== */
  const fetchProductData = async () => {
    if (inFlight) {
      alert('A request is already in progress. Please wait.');
      return;
    }
    setLoading(true);
    setInFlight(true);

    try {
      const [accessToken, storeUrl] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('storeUrl'),
      ]);

      const resp = await fetch(
        `${storeUrl}/api/product-stall-detail-report`,
        {
          method: 'GET',
          headers: { access_token: accessToken, Cookie: 'session_id' },
          redirect: 'follow',
          credentials: 'omit',
        },
      );
      const json = await resp.json();

      if (json?.data) {
        /* keep only rows that have vendor details */
        const cleaned = Object.fromEntries(
          Object.entries(json.data).filter(
            ([, p]) => p.vendorDetails && p.vendorDetails.length,
          ),
        );
        setData(cleaned);
        setPage(0);
      } else {
        alert('Failed to fetch valid data.');
      }
    } catch (err) {
      console.error(err);
      alert('Fetch failed. Try again later.');
    } finally {
      setLoading(false);
      setInFlight(false);
    }
  };

  /* =============== debounce the filter fields =============== */
  const debouncer = useRef(
    debounce((next) => setDebouncedFilter(next), 300),
  ).current;

  useEffect(() => {
    debouncer(filter);        // run on every keystroke
  }, [filter, debouncer]);

  /* =============== memoised filtered dataset =============== */
  const filteredData = useMemo(() => {
    if (!data) return null;
    const { name, barcode } = debouncedFilter;

    return Object.fromEntries(
      Object.entries(data).filter(([bc, p]) => {
        const okName = name
          ? p.product_name.toLowerCase().includes(name.toLowerCase())
          : true;
        const okBarcode = barcode ? bc.includes(barcode) : true;
        return okName && okBarcode;
      }),
    );
  }, [data, debouncedFilter]);

  /* reset to first page whenever the filter (or data) changes */
  useEffect(() => setPage(0), [filteredData]);

  /* =============== scroll to top on page change =============== */
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [page]);

  /* =============== helpers for pagination =============== */
  const barcodes = filteredData ? Object.keys(filteredData) : [];
  const pageCount = Math.ceil(barcodes.length / ITEMS_PER_PAGE);
  const pageKeys = barcodes.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  /* =============== card renderer =============== */
  const renderCard = useCallback(
    (barcode) => {
      const {
        product_name,
        sold_qty,
        category,
        last_sold_date,
        totalVendor,
        totalReceivedQuantity,
        vendorDetails = [],
      } = filteredData[barcode];

      return (
        <Card key={barcode} style={styles.card}>
          <Card.Content>
            <Title>{product_name}</Title>
            <Paragraph>Barcode: {barcode}</Paragraph>
            <Paragraph>Sold Quantity: {sold_qty}</Paragraph>
            <Paragraph>Category: {category}</Paragraph>
            <Paragraph>Last Sold Date: {last_sold_date}</Paragraph>
            <Paragraph>Total Vendors: {totalVendor}</Paragraph>
            <Paragraph>Total Received Quantity: {totalReceivedQuantity}</Paragraph>

            {!!vendorDetails.length && (
              <>
                <Divider style={{ marginVertical: 10 }} />
                <Text style={styles.subtitle}>Vendor Details:</Text>
                {vendorDetails.map((v, i) => (
                  <Paragraph key={i}>
                    Vendor: {v.invoiceName}, Quantity: {v.receivedQuantity}
                  </Paragraph>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
      );
    },
    [filteredData],
  );

  /* ------------------------- UI ------------------------- */
  return (
    <View style={{ flex: 1, padding: 20 }}>
      {data && (
        <>
          <TextInput
            label="Filter by Product Name"
            value={filter.name}
            onChangeText={(t) => setFilter({ ...filter, name: t })}
            style={styles.filterInput}
          />
          <TextInput
            label="Filter by Barcode"
            keyboardType={
              Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'
            }
            value={filter.barcode}
            onChangeText={(t) => setFilter({ ...filter, barcode: t })}
            style={styles.filterInput}
          />
        </>
      )}

      <Button
        mode="contained"
        onPress={fetchProductData}
        disabled={loading || inFlight}
        style={styles.fetchButton}>
        {loading ? 'Fetching Data…' : 'Fetch Latest Data'}
      </Button>

      <LoadingModal visible={loading} />

      {!loading && filteredData && (
        <>
          <ScrollView ref={scrollRef} style={{ marginTop: 20 }}>
            {pageKeys.map(renderCard)}
          </ScrollView>

          <View style={styles.pagination}>
            <Button
              mode="outlined"
              disabled={page === 0}
              onPress={() => setPage((p) => p - 1)}>
              Previous
            </Button>

            <Text style={styles.pageLabel}>
              Page {page + 1} / {pageCount || 1}
            </Text>

            <Button
              mode="outlined"
              disabled={page + 1 >= pageCount}
              onPress={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

export default IcmsProductStallReport;

/* ------------------------------------------------- */
const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  fetchButton: { marginVertical: 10 },
  filterInput: { marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: 'bold' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pageLabel: { fontSize: 16 },
});
