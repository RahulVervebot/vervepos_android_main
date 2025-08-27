import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatYMD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// helper to safely parse ISO/space dates like "2025-09-01 00:00:00"
const parseMaybeDate = (s) => {
  if (!s) return null;
  // handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
  const normalized = s.includes('T') ? s : s.replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

export default function UpdateExpiryModal({
  visible,
  onClose,
  productId,              // required: selectedItem.items[0].id
  expiryList,             // required: array of { expiry_id, lot_number, note, alert_before, expiry_date }
  onDelete,               // optional: (expiry_id) => void  (parent delete if you already have it)
  onSuccess,              // optional: callback after success
}) {
  const [rows, setRows] = useState(
    (expiryList || []).map((it) => ({
      ...it,
      _dateObj: parseMaybeDate(it.expiry_date), // keep editable Date object
      _showPicker: false,
      _loading: false,
      _updating: false,
    }))
  );

  const togglePicker = (idx, show) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, _showPicker: show } : row)));
  };

  const updateField = (idx, key, value) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const doUpdate = async (idx) => {
    const row = rows[idx];
    if (!productId || !row?.expiry_id) {
      alert('Missing product/expiry id.');
      return;
    }
    try {
      updateField(idx, '_updating', true);
      const storeUrl = await AsyncStorage.getItem('storeUrl');
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!storeUrl || !accessToken) {
        alert('Missing credentials.');
        return;
      }

      const payload = {
        data: {
          product_id: productId,
          expiry_line_id: row.expiry_id,
          expiry_date: row._dateObj ? formatYMD(row._dateObj) : (row.expiry_date?.split('T')[0] || row.expiry_date?.split(' ')[0] || ''),
          alert_before: row.alert_before,
          note: row.note,
        },
      };

      const r = await fetch(`${storeUrl}/api/product_expiry/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: accessToken },
        body: JSON.stringify(payload),
        redirect: 'follow',
        credentials: 'omit',
      });

      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const result = await r.json();
      const ok = result?.result?.success;
      alert(ok ? 'Update Successfully' : (result?.result?.error || 'Failed to update'));
      if (ok && onSuccess) onSuccess();
      if (ok) onClose();
    } catch (e) {
      console.log('Expiry update error →', e);
      alert('Failed to update expiry.');
    } finally {
      updateField(idx, '_updating', false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Update/Delete Expiry</Text>
        <IconButton icon="close-circle" size={24} onPress={onClose} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {(rows || []).map((row, idx) => (
          <View key={row.expiry_id || idx} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <Text style={{ marginBottom: 6 }}>Lot Number</Text>
            <TextInput
              value={row.lot_number ?? ''}
              onChangeText={(v) => updateField(idx, 'lot_number', v)}
              placeholder="Enter Lot Number"
              placeholderTextColor="grey"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />

            <Text style={{ marginBottom: 6 }}>Product Note</Text>
            <TextInput
              value={row.note ?? ''}
              onChangeText={(v) => updateField(idx, 'note', v)}
              placeholder="Enter Product Note"
              placeholderTextColor="grey"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />

            <Text style={{ marginBottom: 6 }}>Days For Notification</Text>
            <TextInput
              value={String(row.alert_before ?? '')}
              onChangeText={(v) => updateField(idx, 'alert_before', v)}
              keyboardType="numeric"
              placeholder="Enter Product Expire Day"
              placeholderTextColor="grey"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />

            <Text style={{ marginBottom: 6 }}>Select Expiry Date</Text>
            <TouchableOpacity
              onPress={() => togglePicker(idx, true)}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#3784fd' }}>
                {row._dateObj ? formatYMD(row._dateObj)
                  : (row.expiry_date?.split('T')[0] || row.expiry_date?.split(' ')[0] || 'Open Calendar')}
              </Text>
            </TouchableOpacity>

            {row._showPicker && (
              <DateTimePicker
                value={row._dateObj || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS !== 'ios') togglePicker(idx, false);
                  if (event.type === 'set' && selectedDate) {
                    updateField(idx, '_dateObj', selectedDate);
                  }
                }}
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Button
                mode="contained"
                onPress={() => doUpdate(idx)}
                loading={row._updating}
                disabled={row._updating}
              >
                Update Expiry
              </Button>

              {!!onDelete && (
                <Button
                  mode="outlined"
                  onPress={() => onDelete(row.expiry_id)}
                >
                  Delete Expiry
                </Button>
              )}
            </View>
          </View>
        ))}

        <Button mode="outlined" onPress={onClose} style={{ marginTop: 10 }}>
          Close
        </Button>
      </ScrollView>
    </Modal>
  );
}
