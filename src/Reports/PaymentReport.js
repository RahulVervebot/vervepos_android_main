import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  useWindowDimensions
} from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  List,
  IconButton
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { DateTime, IANAZone } = require('luxon');

const PaymentReport = () => {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const LIST_HEIGHT = height * 0.65;
  const colorScheme = useColorScheme();
  const [selectedItem, setSelectedItem] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPeriodName, setSelectedPeriodName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

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
  const allowedZones = [
  'UTC', 'America/New_York', 'Asia/Kolkata', 'Europe/London',
  'America/Chicago','America/Denver','America/Phoenix',
  'America/Los_Angeles','America/Anchorage','America/Adak',
  'Pacific/Honolulu','Pacific/Pago_Pago','America/Indiana/Indianapolis'
];
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


  const [startDateValue, setStartDateValue] = useState(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
});

// Set default endDateValue to 23:59:59 today
const [endDateValue, setEndDateValue] = useState(() => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
});

const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showStartTimePicker, setShowStartTimePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
const [showEndTimePicker, setShowEndTimePicker] = useState(false);


useEffect(() => {
  const FetchAsyncValueInAwait = async () => {
    try {
      const maybeZone = (await AsyncStorage.getItem('tz')) || 'America/New_York';
      let zoneToUse = ZONE_ALIASES[maybeZone] ?? maybeZone;

      if (!allowedZones.includes(zoneToUse)) {
        console.warn(`"${zoneToUse}" is not in allowed list, falling back to America/New_York.`);
        zoneToUse = 'America/New_York';
      }

      setTimezone(zoneToUse);

      // ✅ Use UTC + offset
      const offset = ZONE_OFFSETS[zoneToUse] ?? 0;
      const now = DateTime.utc().plus({ hours: offset });

      if (!now.isValid) {
        console.warn(`Still invalid datetime after offset for zone: ${zoneToUse}`);
      }

      const timestampStart = now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
      const timestampEnd = now.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');

      console.log("timestampStart:", timestampStart, "timestampEnd:", timestampEnd);

      setStartDate(timestampStart);
      setEndDate(timestampEnd);
    } catch (error) {
      console.log('Error in Getting Cost Price Validation Field', error);
    }
  };

  FetchAsyncValueInAwait();
}, []);


  const handleNewStartDateConfirm = (event, selectedDate) => {
    const timestamp = event.nativeEvent.timestamp;
    const final = convertTimestampToZoneForStartDate(timestamp);
    setStartDateValue(new Date(timestamp));
  };

  const handleNewEndDateConfirm = (event, selectedDate) => {
    const timestamp = event.nativeEvent.timestamp;
    const final = convertTimestampToZoneForEndDate(timestamp);
    setEndDateValue(new Date(timestamp));
  };


  // for android
  const convertTimestampToZoneForStartDate = (ms) => {
  const offset = ZONE_OFFSETS[timezone] ?? 0;
  const formatted = DateTime.fromMillis(ms).plus({ hours: offset }).toFormat('yyyy-MM-dd HH:mm:ss');
  setStartDate(formatted);
  return formatted;
};

const convertTimestampToZoneForEndDate = (ms) => {
  const offset = ZONE_OFFSETS[timezone] ?? 0;
  const formatted = DateTime.fromMillis(ms).plus({ hours: offset }).toFormat('yyyy-MM-dd HH:mm:ss');
  setEndDate(formatted);
  return formatted;
};

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
// for ios
    // const now = DateTime.fromMillis(Date.now(), { zone: timezone });
    // const yesterday = now.minus({ days: 1 });

// for android
      const offset = ZONE_OFFSETS[timezone] ?? 0;
  const now = DateTime.utc().plus({ hours: offset });
  const yesterday = now.minus({ days: 1 });


    if (timePeriod !== 'Custom') {
      setIsCustom(false);
    }

    switch (timePeriod) {
      case 'Today':
        setStartDate(now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Yesterday':
        setStartDate(yesterday.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(yesterday.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Current Week':
        setStartDate(now.startOf('week').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.endOf('week').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Previous Week':
        setStartDate(now.minus({ weeks: 1 }).startOf('week').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.minus({ weeks: 1 }).endOf('week').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Current Month':
        setStartDate(now.startOf('month').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.endOf('month').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Previous Month':
        setStartDate(now.minus({ months: 1 }).startOf('month').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.minus({ months: 1 }).endOf('month').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Current Quarter':
        setStartDate(now.startOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.endOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Previous Quarter':
        setStartDate(now.minus({ quarters: 1 }).startOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.minus({ quarters: 1 }).endOf('quarter').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Current Year':
        setStartDate(now.startOf('year').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.endOf('year').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Previous Year':
        setStartDate(now.minus({ years: 1 }).startOf('year').toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(now.minus({ years: 1 }).endOf('year').toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Current Fiscal Year':
        const fiscalStart = DateTime.fromObject({ year: now.year, month: 4, day: 1 }, { zone: timezone }).startOf('day');
        const actualStart = now < fiscalStart ? fiscalStart.minus({ years: 1 }) : fiscalStart;
        setStartDate(actualStart.toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(actualStart.plus({ years: 1 }).minus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss'));
        break;
      case 'Previous Fiscal Year':
        const fyStart = DateTime.fromObject({ year: now.year, month: 4, day: 1 }, { zone: timezone }).startOf('day');
        const startFY = now < fyStart ? fyStart.minus({ years: 1 }) : fyStart;
        const prevFYStart = startFY.minus({ years: 1 });
        const prevFYEnd = startFY.minus({ days: 1 });
        setStartDate(prevFYStart.toFormat('yyyy-MM-dd HH:mm:ss'));
        setEndDate(prevFYEnd.toFormat('yyyy-MM-dd HH:mm:ss'));
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

     {isCustom && (
  <View style={{ marginTop: 20 }}>
    {/* Start Date */}
    <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 16 , marginTop: 20,marginBottom:20 }}>
     Start Date: {DateTime.fromJSDate(startDateValue).toFormat('yyyy-MM-dd HH:mm:ss')}
    </Text>
         <View style={{flexDirection:"row"}}>
     <Button onPress={() => setShowStartDatePicker(true)} mode="outlined" style={{marginRight:"2%"}}>
  Select Start Date
</Button>
<Button onPress={() => setShowStartTimePicker(true)} mode="outlined">
  Select Start Time
</Button>
    </View>
    {/* End Date */}
    <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 16, marginTop: 20,marginBottom:20 }}>
      End Date: {DateTime.fromJSDate(endDateValue).toFormat('yyyy-MM-dd HH:mm:ss')}
    </Text>
   <View style={{flexDirection:"row"}}>
 <Button onPress={() => setShowEndDatePicker(true)} mode="outlined" style={{marginRight:"2%"}}>
  Select End Date
</Button>
<Button onPress={() => setShowEndTimePicker(true)} mode="outlined">
  Select End Time
</Button>
</View>
 <View style={{flexDirection:"row"}}>
{showStartDatePicker && (
    <DateTimePicker
      value={startDateValue}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
        if (event.type === 'set' && selectedDate) {
          const newDate = new Date(startDateValue);
          newDate.setFullYear(selectedDate.getFullYear());
          newDate.setMonth(selectedDate.getMonth());
          newDate.setDate(selectedDate.getDate());
          setStartDateValue(newDate);
          convertTimestampToZoneForStartDate(newDate.getTime());
        }
      }}
    />
   ) }
   {showStartTimePicker && (
    <DateTimePicker
      value={startDateValue}
      mode="time"
      display="default"
      onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
        if (event.type === 'set' && selectedTime) {
          const newTime = new Date(startDateValue);
          newTime.setHours(selectedTime.getHours());
          newTime.setMinutes(selectedTime.getMinutes());
          setStartDateValue(newTime);
          convertTimestampToZoneForStartDate(newTime.getTime());
        }
      }}
    />
    )}
</View>
<View style={{flexDirection:"row"}}>
{showEndDatePicker && (
    <DateTimePicker
      value={new Date(
    endDateValue.getFullYear(),
    endDateValue.getMonth(),
    endDateValue.getDate()
  )}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
        if (event.type === 'set' && selectedDate) {
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
    {showEndTimePicker && (
    <DateTimePicker
      value={endDateValue}
      mode="time"
      display="default"
      onChange={(event, selectedTime) => {
              setShowEndTimePicker(false);
        if (event.type === 'set' && selectedTime) {
          const newTime = new Date(endDateValue);
          newTime.setHours(selectedTime.getHours());
          newTime.setMinutes(selectedTime.getMinutes());
          setEndDateValue(newTime);
          convertTimestampToZoneForEndDate(newTime.getTime());
        }
      }}
    />
    )}
    </View>
  </View>

)}
 
        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          onPress={() => {
            navigation.navigate('PaymentReportScreen', {
              startDate,
              endDate
            });
          }}
        >
          View Report
        </Button>
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
  }
});
