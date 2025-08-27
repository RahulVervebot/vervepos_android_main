import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatYMD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AddExpiryModal({
  visible,
  onClose,
  productId,             // required: selectedItem.items[0].id
  onSuccess,             // optional: callback after success (e.g., refresh UI, show save button)
}) {
  const [lotNumber, setLotNumber] = useState('');
  const [note, setNote] = useState('');
  const [daysBefore, setDaysBefore] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // basic validation
    if (!productId) {
      alert('Missing product id.');
      return;
    }
    if (!expiryDate) {
      alert('Please select expiry date.');
      return;
    }
    if (daysBefore === '' || isNaN(Number(daysBefore))) {
      alert('Enter a valid number of days for notification.');
      return;
    }

    try {
      setLoading(true);
      const storeUrl = await AsyncStorage.getItem('storeUrl');
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!storeUrl || !accessToken) {
        alert('Missing credentials.');
        return;
      }

      const payload = {
        data: [
          {
            product_id: productId,
            lot_number: lotNumber,
            expiry_date: formatYMD(expiryDate),  // YYYY-MM-DD for Odoo
            alert_before: daysBefore,
            note,
          },
        ],
      };

      const r = await fetch(`${storeUrl}/api/product_expiry/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: accessToken },
        body: JSON.stringify(payload),
        redirect: 'follow',
        credentials: 'omit',
      });

      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const result = await r.json();
      const ok = result?.result?.success;
      alert(ok ? 'Added Successfully' : (result?.result?.error || 'Failed to add'));
      if (ok && onSuccess) onSuccess(); // e.g., setShowButton(true), refresh list
      onClose();
    } catch (err) {
      console.log('Expiry add error →', err);
      alert('Failed to add expiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
          Add Product Expiry
        </Text>

        <Text style={{ marginBottom: 6 }}>Lot Number</Text>
        <TextInput
          value={lotNumber}
          onChangeText={setLotNumber}
          placeholder="Enter Lot Number"
          placeholderTextColor="grey"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
        />

        <Text style={{ marginBottom: 6 }}>Product Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Enter Product Note"
          placeholderTextColor="grey"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
        />

        <Text style={{ marginBottom: 6 }}>Days For Notification</Text>
        <TextInput
          value={daysBefore}
          onChangeText={setDaysBefore}
          placeholder="Enter Days"
          placeholderTextColor="grey"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
        />

        <Text style={{ marginBottom: 6 }}>Select Expiry Date</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#3784fd' }}>
            {expiryDate ? formatYMD(expiryDate) : 'Open Calendar'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={expiryDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={(event, selectedDate) => {
              if (Platform.OS !== 'ios') setShowPicker(false);
              if (event.type === 'set' && selectedDate) {
                setExpiryDate(selectedDate);
              }
            }}
          />
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 }}>
          <Button mode="contained" onPress={submit} loading={loading} disabled={loading}>
            Add Expiry
          </Button>
          <Button mode="outlined" onPress={onClose} disabled={loading}>
            Close
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
}
