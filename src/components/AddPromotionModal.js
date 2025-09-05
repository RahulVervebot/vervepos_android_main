import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - productId: number | string (required)
 *  - defaultStartDate?: Date   (optional, defaults to today 00:00:00)
 *  - defaultEndDate?: Date     (optional, defaults to +7 days 23:59:59)
 *  - onSaved?: (respJson) => void  (optional: called on success)
 */
export default function AddPromotionModal({
  visible,
  onClose,
  productId,
  productAmount,
  productBuyNo,
  productPromoStartDate,
  productPromoEndDate,
  onSaved,
}) {
  const colorScheme = useColorScheme();

  // ---------- helpers ----------
  const toYMDHMS = (d, isEnd) => {
    // Build local date string: yyyy-MM-dd HH:mm:ss
    const dd = new Date(d);
    if (isEnd) dd.setHours(23, 59, 59, 0);
    else dd.setHours(0, 0, 0, 0);

    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    const time = isEnd ? '23:59:59' : '00:00:00';
    return `${y}-${m}-${day} ${time}`;
  };

  const today00 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const plus7_2359 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);
  // ---------- state ----------
  const [fixedAmount, setFixedAmount] = useState('0');
  const [noOfProducts, setNoOfProducts] = useState('0');
  const [defaultstartDate, setDefaultStartDate] = useState(productPromoStartDate !== null ? productPromoStartDate : null);
  const [defaultendDate, setDefaultEndDate] = useState(productPromoEndDate !== null ? productPromoEndDate : null);
  const [startDate, setStartDate] = useState(today00);
  const [endDate, setEndDate] = useState(plus7_2359);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------- derived strings for display / api ----------
  const startDateString = toYMDHMS(startDate, false); // yyyy-MM-dd 00:00:00
  const endDateString = toYMDHMS(endDate, true);      // yyyy-MM-dd 23:59:59

  // ---------- handlers ----------
  const onChangeStart = (event, date) => {
    // Android closes on select/cancel — iOS stays open
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (event?.type === 'dismissed') return;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      setStartDate(d);
      setDefaultStartDate(null);
    }
  };

  const onChangeEnd = (event, date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (event?.type === 'dismissed') return;
    if (date) {
      const d = new Date(date);
      d.setHours(23, 59, 59, 0);
      setEndDate(d);
      setDefaultEndDate(null)
    }
  };

  const handleSave = async () => {
    const amt = parseFloat(fixedAmount !== '0' ? fixedAmount : productAmount);
    const qty = parseInt(noOfProducts !== '0' ? noOfProducts : productBuyNo , 10);

    if (!productId) {
      alert('Missing product id.');
      return;
    }
    if (!(amt >= 0)) {
      alert('Enter a valid fixed amount (0 or more).');
      return;
    }
    if (!(qty > 0)) {
      alert('Enter a valid quantity (> 0).');
      return;
    }
    if (startDate > endDate) {
      alert('Start date cannot be after End date.');
      return;
    }

    setLoading(true);
    try {
      const storeUrl = await AsyncStorage.getItem('storeUrl');
      const token = await AsyncStorage.getItem('access_token');
      if (!storeUrl || !token) {
        alert('Missing credentials.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        fix_amount: String(amt),
        product_id: String(productId),
        start_date: defaultstartDate !== null? defaultstartDate : startDateString, // "yyyy-MM-dd 00:00:00"
        end_date: defaultendDate !== null ? defaultendDate : endDateString,     // "yyyy-MM-dd 23:59:59"
        no_of_products: String(qty),
      });

      const requestOptions = {
        method: 'POST',
        headers: { access_token: token },
        redirect: 'follow',
        credentials: 'omit',
      };

      const r = await fetch(`${storeUrl}/api/add/promotion?${params.toString()}`, requestOptions);
      const txt = await r.text();
      let json;
      try {
        json = JSON.parse(txt);
      } catch (e) {
        json = { message: txt || 'Promotion saved.' };
      }

      alert(json.message ?? 'Promotion saved.');
      onSaved && onSaved(json);
      onClose && onClose();
    } catch (e) {
      console.log('promotion error', e);
      alert('Failed to add promotion.');
    } finally {
      setLoading(false);
    }
  };

  const headerTextColor = { color: colorScheme === 'dark' ? '#fff' : '#000' };

  // ---------- UI ----------
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[{ fontSize: 22, fontWeight: '700' }, headerTextColor]}>Add Promotion</Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#f33' }}
          >
            <Text style={{ color: '#f33', fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Illustration / spacer */}
        <View style={{ height: 10 }} />

        {/* Fixed Amount */}
        <Text style={[{ fontSize: 16, marginTop: 18 }, headerTextColor]}>Fixed Amount</Text>
        <TextInput
          keyboardType="numeric"
          placeholder={String(productAmount)}
          placeholderTextColor="grey"
          value={fixedAmount !== '0' ? fixedAmount : String(productAmount)}
          onChangeText={setFixedAmount}
          style={{
            height: 44,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            marginTop: 8,
          }}
        />

        {/* Qty to Buy */}
        <Text style={[{ fontSize: 16, marginTop: 18 }, headerTextColor]}>No. of Products to Buy</Text>
        <TextInput
          keyboardType="numeric"
          placeholder={String(productBuyNo)}
          placeholderTextColor="grey"
          value={noOfProducts !== '0' ? noOfProducts : String(productBuyNo)}
          onChangeText={setNoOfProducts}
          style={{
            height: 44,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            marginTop: 8,
          }}
        />

        {/* Dates */}
        <Text style={[{ fontSize: 18, marginTop: 24, fontWeight: '700' }, headerTextColor]}>Promotion Dates</Text>

        {/* Start */}
        <Text style={[{ fontSize: 14, marginTop: 14 }, headerTextColor]}>Start Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View
            style={{
              flex: 1,
              height: 44,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              paddingHorizontal: 12,
              justifyContent: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ color: '#3784fd' }}>{defaultstartDate !== null? defaultstartDate?.split(' ')[0] : startDateString.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={{
              marginLeft: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#3784fd',
            }}
          >
            <Text style={{ color: '#3784fd', fontWeight: '600' }}>Select</Text>
          </TouchableOpacity>
        </View>
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            onChange={onChangeStart}
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            themeVariant={colorScheme}
            textColor={colorScheme === 'dark' ? 'white' : 'black'}
          />
        )}

        {/* End */}
        <Text style={[{ fontSize: 14, marginTop: 18 }, headerTextColor]}>End Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View
            style={{
              flex: 1,
              height: 44,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              paddingHorizontal: 12,
              justifyContent: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ color: '#3784fd' }}>{defaultendDate !== null ? defaultendDate?.split(' ')[0] : endDateString.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={{
              marginLeft: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#3784fd',
            }}
          >
            <Text style={{ color: '#3784fd', fontWeight: '600' }}>Select</Text>
          </TouchableOpacity>
        </View>
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            onChange={onChangeEnd}
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            themeVariant={colorScheme}
            textColor={colorScheme === 'dark' ? 'white' : 'black'}
          />
        )}

        {/* Buttons */}
        <View style={{ height: 24 }} />
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            alignSelf: 'center',
            backgroundColor: '#3784fd',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            width: '100%',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>Save Promotion</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Modal>
  );
}
