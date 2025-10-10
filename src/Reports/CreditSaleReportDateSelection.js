// screens/PaymentReport.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Provider,
  IconButton,
  useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { DateTime, IANAZone } = require('luxon');

// ✅ Reusable date selector (no-paper) – uses same format/offset logic
import SelectPeriodButtonRN from '../components/SelectPeriodButtonRN';

const PaymentReport = () => {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const { spacing = 8 } = useTheme();
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
  'UTC': 0,
};


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

  const colorScheme = useColorScheme(); // 'light' | 'dark'
  const [startDate, setStartDate] = useState(null); // 'yyyy-MM-dd HH:mm:ss'
  const [endDate, setEndDate] = useState(null);
  const [selectedPeriodName, setSelectedPeriodName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York'); // default value

  const [numProducts, setNumProducts] = useState('');

  // Zone alias map (same as your original)
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

  // Initial timezone + default to Today (same formatting)
useEffect(() => {
  const init = async () => {
    try {
      // 1) get tz (alias → IANA, validate)
      const maybeZone = (await AsyncStorage.getItem('tz')) || 'America/New_York';
      const aliasResolved = ZONE_ALIASES[maybeZone] ?? maybeZone;
      const safeZone = IANAZone.isValidZone(aliasResolved) ? aliasResolved : 'America/New_York';
      setTimezone(safeZone);

      // 2) compute now same way as SelectPeriodButtonRN: UTC + offset hours
      const offset = ZONE_OFFSETS[safeZone] ?? 0;
      const now = DateTime.utc().plus({ hours: offset });

      // 3) format exactly 'yyyy-MM-dd HH:mm:ss'
      const start = now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
      const end   = now.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');

      setStartDate(start);
      setEndDate(end);
      setSelectedPeriodName('Today');  // so label shows immediately
    } catch (err) {
      console.log('Init tz/dates error', err);
    }
  };
  init();
}, []);
 
  return (
    <Provider>
      <View style={[
        styles.container,
        colorScheme === 'dark' && { backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: 'rgba(255, 255, 255, 0.5)' }
      ]}>

        {/* 🔁 Replaced the old Button+Dialog with the reusable selector */}
        <SelectPeriodButtonRN
          buttonText="Select Period"
          onChange={({ label, startDate, endDate, timezone: tz }) => {
            setSelectedPeriodName(label);
            setTimezone(tz);
            setStartDate(startDate);
            setEndDate(endDate);
          }}
          // keeps same list of periods (includes Custom)
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
          {selectedPeriodName ? (
            <Text style={[styles.periodText, colorScheme === 'dark' && { color: 'white' }]}>
              {selectedPeriodName}
            </Text>
          ) : null}
        </View>

        {/* From/To boxes (unchanged UI) */}
        {startDate && endDate && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[{ fontSize: 16, marginBottom: 5 }, colorScheme === 'dark' && { color: 'white' }]}>
                From
              </Text>
              <View style={[styles.dateBox, colorScheme === 'dark' && { borderColor: 'white' }]}>
                <Text style={[styles.dateText, colorScheme === 'dark' && { color: 'white' }]}>
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
          </View>
        )}

        <View style={{ marginBottom: spacing * 3 }} />

        <TextInput
          label="Number of Products"
          value={numProducts}
          onChangeText={setNumProducts}
          placeholder="Default 10"
          keyboardType="number-pad"
          returnKeyType="done"
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
              onPress={() => setNumProducts('')}
            />
          }
        />

        {endDate && startDate ? (
          <Button
            mode="contained"
            onPress={() => {
              console.log('startDate In Navigation : ', startDate);
              console.log('endDate in Navigation: ', endDate);
              navigation.navigate('CreditSaleReport', {
                startDate,
                endDate,
              });
            }}
            style={styles.viewReportButton}
          >
            View Report
          </Button>
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
  },
  input: {
    marginTop: 16,
  }
});
