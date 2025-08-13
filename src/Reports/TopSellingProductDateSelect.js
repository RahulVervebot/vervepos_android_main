import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  FlatList,
  useWindowDimensions,
  Keyboard
} from 'react-native';
import {
  TextInput,
  Button,
  Dialog,
  Portal,
  Provider,
  List,
  IconButton,
  useTheme
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import promoGif from '../images/homeBG.webp';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { DateTime, IANAZone } = require('luxon');

const PaymentReport = () => {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const LIST_HEIGHT = height * 0.65;
  const { spacing = 8 } = useTheme();

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numProducts, setNumProducts] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPeriodName, setSelectedPeriodName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York'); // default value
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  const [startDateValue, setStartDateValue] = useState(new Date());
  const [endDateValue, setEndDateValue] = useState(new Date());


  const convertTimestampToZoneForStartDate = (ms) => {
    const offset = ZONE_OFFSETS[timezone] ?? 0;
    const formatted = DateTime.fromMillis(ms).plus({ hours: offset }).toFormat('yyyy-MM-dd HH:mm:ss');
    console.log("formatted start:", formatted);
    setStartDate(formatted);
    return formatted;
  };

  const convertTimestampToZoneForEndDate = (ms) => {
    const offset = ZONE_OFFSETS[timezone] ?? 0;
    const formatted = DateTime.fromMillis(ms).plus({ hours: offset }).toFormat('yyyy-MM-dd HH:mm:ss');
    console.log("formatted end:", formatted);
    // const myEndDateTime = DateTime.fromMillis(ms, { zone: timezone }).endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    setEndDate(formatted);
    return formatted;
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

  const data = [
    { id: 1, name: 'Custom' },
    { id: 2, name: 'Today' },
    { id: 3, name: 'Yesterday' },
    { id: 4, name: 'Current Week' },
    { id: 5, name: 'Previous Week' },
    { id: 6, name: 'Current Month' },
    { id: 7, name: 'Previous Month' },
    { id: 8, name: 'Current Quarter' },
    { id: 9, name: 'Previous Quarter' },
    { id: 10, name: 'Current Year' },
    { id: 11, name: 'Previous Year' },
    { id: 12, name: 'Current Fiscal Year' },
    { id: 13, name: 'Previous Fiscal Year' },
  ];
  const onSelect = (item) => {
    setSelectedItem(item);
    setSelectedPeriodName(item.name);
    setDialogVisible(false);
    const timePeriod = item.name;
    // const now = DateTime.fromMillis(Date.now(), { zone: timezone })
    const offset = ZONE_OFFSETS[timezone] ?? 0;
    const now = DateTime.utc().plus({ hours: offset });
    console.log('now : ', now);
    const yesterday = now.minus({ days: 1 });

    if (timePeriod !== 'Custom') {
      setIsCustom(false);
    }
    switch (timePeriod) {
      case 'Today':

        const startToday = now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
        const endToday = now.endOf('day').endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startToday);
        setEndDate(endToday);
        break;
      case 'Yesterday':

        const startYesterday = yesterday.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
        const endYesterday = yesterday.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startYesterday);
        setEndDate(endYesterday);
        break;
      case 'Current Week':

        const startCurrentWeek = now.startOf('week').toFormat('yyyy-MM-dd HH:mm:ss');
        const endCurrentWeek = now.endOf('week').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startCurrentWeek);
        setEndDate(endCurrentWeek);
        break;
      case 'Previous Week':

        const startPreviousWeek = now.minus({ weeks: 1 }).startOf('week').toFormat('yyyy-MM-dd HH:mm:ss');
        const endPreviousWeek = now.minus({ weeks: 1 }).endOf('week').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startPreviousWeek);
        setEndDate(endPreviousWeek);
        break;
      case 'Current Month':

        const startCurrentMonth = now.startOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        const endCurrentMonth = now.endOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startCurrentMonth);
        setEndDate(endCurrentMonth);
        break;
      case 'Previous Month':

        const startPreviousMonth = now.minus({ months: 1 }).startOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        const endPreviousMonth = now.minus({ months: 1 }).endOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startPreviousMonth);
        setEndDate(endPreviousMonth);
        break;
      case 'Current Quarter':

        const startCurrentQuarter = now.startOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss');
        const endCurrentQuarter = now.endOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startCurrentQuarter);
        setEndDate(endCurrentQuarter);
        break;
      case 'Previous Quarter':

        const startPreviousQuarter = now.minus({ quarters: 1 }).startOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss');
        const endPreviousQuarter = now.minus({ quarters: 1 }).endOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startPreviousQuarter);
        setEndDate(endPreviousQuarter);
        break;
      case 'Current Year':

        const startCurrentYear = now.startOf('year').toFormat('yyyy-MM-dd HH:mm:ss');
        const endCurrentYear = now.endOf('year').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startCurrentYear);
        setEndDate(endCurrentYear);
        break;
      case 'Previous Year':

        const startPreviousYear = now.minus({ years: 1 }).startOf('year').toFormat('yyyy-MM-dd HH:mm:ss');
        const endPreviousYear = now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startPreviousYear);
        setEndDate(endPreviousYear);
        break;
      case 'Current Fiscal Year':

        const fiscalYearStart = DateTime.fromObject({ year: now.year, month: 4, day: 1, }).startOf('day');
        const startCurrentFiscalYear = now < fiscalYearStart ? fiscalYearStart.minus({ years: 1 }) : fiscalYearStart;
        const endCurrentFiscalYear = startCurrentFiscalYear.plus({ years: 1 }).minus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startCurrentFiscalYear.toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(endCurrentFiscalYear);
        break;
      case 'Previous Fiscal Year':

        const fyStartThisYear = DateTime.fromObject({ year: now.year, month: 4, day: 1 }, { zone: timezone }).startOf('day');
        const startCurrentFY = now < fyStartThisYear ? fyStartThisYear.minus({ years: 1 }) : fyStartThisYear;
        const endCurrentFY = startCurrentFY.plus({ years: 1 }).minus({ days: 1 });
        const startPreviousFY = startCurrentFY.minus({ years: 1 });
        const endPreviousFY = startCurrentFY.minus({ days: 1 });
        const startPreviousFiscalYear = startPreviousFY.toFormat('yyyy-MM-dd HH:mm:ss');
        const endPreviousFiscalYear = endCurrentFY.minus({ years: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');
        setStartDate(startPreviousFiscalYear);
        setEndDate(endPreviousFiscalYear);
        break;
      case 'Custom':
        setIsCustom(true);
        break;
    }
  };


  return (
    <Provider>
      <View style={[
        styles.container,
        colorScheme === 'dark' && { backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: 'rgba(255, 255, 255, 0.5)' }
      ]}>

        <Button mode="contained" onPress={() => setDialogVisible(true)}>
          Select Period
        </Button>

        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
            style={[
              { width: '90%', alignSelf: 'center', maxHeight: height * 0.8 },
              colorScheme === 'dark' && { backgroundColor: '#333' },
            ]}
          >

            <Dialog.Content style={{ paddingTop: 0 }}>
              <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                style={{ height: LIST_HEIGHT }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <List.Item
                    title={item.name}
                    onPress={() => onSelect(item)}
                    titleStyle={colorScheme === 'dark' && { color: 'white' }}
                  />
                )}
              />
            </Dialog.Content>
          </Dialog>
        </Portal>

        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
          {selectedPeriodName ? (
            <Text style={[styles.periodText, colorScheme === 'dark' && { color: 'white' }]}>
              {selectedPeriodName}
            </Text>
          ) : null}
        </View>

        {selectedItem && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
            {isCustom === true ? (
              <>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    From: {startDate}
                  </Text>
                   <Button onPress={() => setShowStartDatePicker(true)} mode="outlined" style={{ marginRight: "2%" }}>
                                      Select Start Date
                                    </Button>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDateValue ? new Date(startDateValue) : new Date()}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (event.type === 'set') {
                          // handleNewStartDateConfirm(event, selectedDate);
                          const newDate = new Date(startDateValue);
                          newDate.setFullYear(selectedDate.getFullYear());
                          newDate.setMonth(selectedDate.getMonth());
                          newDate.setDate(selectedDate.getDate());
                          setStartDateValue(newDate);
                          convertTimestampToZoneForStartDate(newDate.getTime());
                        }
                      }}
                    />
                  )}
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    To: {endDate}
                  </Text>
                   <Button onPress={() => setShowEndDatePicker(true)} mode="outlined" style={{ marginRight: "2%" }}>
                                      Select End Date
                                    </Button>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDateValue ? new Date(endDateValue) : new Date()}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (event.type === 'set') {
                          const newDate = new Date(endDateValue);
                          newDate.setFullYear(selectedDate.getFullYear());
                          newDate.setMonth(selectedDate.getMonth());
                          newDate.setDate(selectedDate.getDate());
                          setEndDateValue(newDate);
                          convertTimestampToZoneForEndDate(newDate.getTime());
                        }
                      }}
                    />
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    From
                  </Text>
                  <View style={[styles.dateBox, colorScheme === 'dark' && { borderColor: 'white' }]}>
                    <Text style={[styles.dateText, colorScheme === 'dark' && { color: 'white' }]}>
                      {console.log('startDate : ', startDate)}
                      {startDate?.split(' ')[0]}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    To
                  </Text>
                  <View style={[styles.dateBox, colorScheme === 'dark' && { borderColor: 'white' }]}>
                    <Text style={[styles.dateText, colorScheme === 'dark' && { color: 'white' }]}>
                      {endDate?.split(' ')[0]}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ marginBottom: spacing * 3 }} />

        <TextInput
          label="Number of Products"
          value={numProducts}
          onChangeText={setNumProducts}
          placeholder="Default 10"
          keyboardType="number-pad"               // number-pad = numeric on both OSes
          returnKeyType="done"                    // Android shows “Done” key
          style={[
            styles.input,
            colorScheme === 'dark' && {
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
            },
          ]}
          theme={{ colors: { text: colorScheme === 'dark' ? 'white' : 'black' } }}
          right={
            <TextInput.Icon
              icon="close"
              onPress={() => Keyboard.dismiss()}   // hides the keyboard
            />
          }
        />

        {endDate && startDate ? (
          <>
            {/* Since in this datetime picker we have to give a state and end date in useeffect so we have to add condition for selectedItem false else on selecting value from popup it will show two times here. */}
            {!selectedItem ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    From
                  </Text>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDateValue ? new Date(startDateValue) : new Date()}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (event.type === 'set') {
                          // handleNewStartDateConfirm(event, selectedDate);
                          const newDate = new Date(startDateValue);
                          newDate.setFullYear(selectedDate.getFullYear());
                          newDate.setMonth(selectedDate.getMonth());
                          newDate.setDate(selectedDate.getDate());
                          setStartDateValue(newDate);
                          convertTimestampToZoneForStartDate(newDate.getTime());
                        }
                      }}
                    />
                  )}
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                    To
                  </Text>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDateValue ? new Date(endDateValue) : new Date()}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (event.type === 'set') {
                          const newDate = new Date(endDateValue);
                          newDate.setFullYear(selectedDate.getFullYear());
                          newDate.setMonth(selectedDate.getMonth());
                          newDate.setDate(selectedDate.getDate());
                          setEndDateValue(newDate);
                          convertTimestampToZoneForEndDate(newDate.getTime());
                        }
                      }}
                    />
                  )}
                </View>
              </View>) : null}
            <Button
              mode="contained"
              onPress={() => {
                // Pass the startDate and endDate to the PaymentReportScreen
                console.log('startDate In Navigation : ', startDate);
                console.log('endDate in Navigation: ', endDate);

                navigation.navigate('TopSellingProducts', {
                  startDate: startDate,
                  endDate: endDate,
                  numProducts: numProducts || '20', // Pass the number of customers or default to 20
                });
              }}
              style={styles.viewReportButton}
            >
              View Report
            </Button>
          </>
        ) : null}
      </View>
    </Provider>
  );
};

export default PaymentReport;

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(126, 129, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: '2%',
    borderWidth: 1,
    marginVertical: '2%',
    padding: '3%',
    borderRadius: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  dateBox: {
    padding: 10,
    width: '100%',
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#3399ff',
    textAlign: 'center',
  },
  viewReportButton: {
    marginHorizontal: '4%',
    marginTop: '4%',
  },
  periodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});