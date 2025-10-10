// components/SelectPeriodButtonRN.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList,
  useWindowDimensions, StyleSheet, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTime, IANAZone } from 'luxon';

// --- Same periods as your original ---
const DEFAULT_PERIODS = [
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

// --- SAME alias and offsets as your first code ---
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
  'US/East-Indiana': 'America/Indiana/Indianapolis',
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
  'UTC': 0,
};

// EXACT SAME string format
const FMT = 'yyyy-MM-dd HH:mm:ss';
const formatMs = (ms) => DateTime.fromMillis(ms).toFormat(FMT);

const normalizeZone = (z) => {
  let zone = ZONE_ALIASES[z] ?? z;
  if (!IANAZone.isValidZone(zone)) zone = 'America/New_York';
  return zone;
};

// Compute ranges EXACTLY like your first code: now = UTC + offset hours
function computePresetRange(name, timezone) {
  const offset = ZONE_OFFSETS[timezone] ?? 0;
  const now = DateTime.utc().plus({ hours: offset }); // <-- key line
  const yesterday = now.minus({ days: 1 });

  const s = (dt) => dt.toFormat(FMT);
  switch (name) {
    case 'Today': {
      const start = now.startOf('day');
      const end = now.endOf('day');
      return { startDate: s(start), endDate: s(end) };
    }
    case 'Yesterday': {
      const start = yesterday.startOf('day');
      const end = yesterday.endOf('day');
      return { startDate: s(start), endDate: s(end) };
    }
    case 'Current Week': {
      return { startDate: s(now.startOf('week')), endDate: s(now.endOf('week')) };
    }
    case 'Previous Week': {
      const p = now.minus({ weeks: 1 });
      return { startDate: s(p.startOf('week')), endDate: s(p.endOf('week')) };
    }
    case 'Current Month': {
      return { startDate: s(now.startOf('month')), endDate: s(now.endOf('month')) };
    }
    case 'Previous Month': {
      const p = now.minus({ months: 1 });
      return { startDate: s(p.startOf('month')), endDate: s(p.endOf('month')) };
    }
    case 'Current Quarter': {
      return { startDate: s(now.startOf('quarter')), endDate: s(now.endOf('quarter')) };
    }
    case 'Previous Quarter': {
      const p = now.minus({ quarters: 1 });
      return { startDate: s(p.startOf('quarter')), endDate: s(p.endOf('quarter')) };
    }
    case 'Current Year': {
      return { startDate: s(now.startOf('year')), endDate: s(now.endOf('year')) };
    }
    case 'Previous Year': {
      const p = now.minus({ years: 1 });
      return { startDate: s(p.startOf('year')), endDate: s(p.endOf('year')) };
    }
    case 'Current Fiscal Year': {
      // Your original used fromObject with zone for FY calc—preserve that
      const fyStart = DateTime.fromObject({ year: now.year, month: 4, day: 1 }, { zone: timezone }).startOf('day');
      const startFY = now < fyStart ? fyStart.minus({ years: 1 }) : fyStart;
      const endFY = startFY.plus({ years: 1 }).minus({ days: 1 }).endOf('day');
      return { startDate: s(startFY), endDate: s(endFY) };
    }
    case 'Previous Fiscal Year': {
      const fyStartThisYear = DateTime.fromObject({ year: now.year, month: 4, day: 1 }, { zone: timezone }).startOf('day');
      const startCurrentFY = now < fyStartThisYear ? fyStartThisYear.minus({ years: 1 }) : fyStartThisYear;
      const startPrevFY = startCurrentFY.minus({ years: 1 });
      const endPrevFY = startCurrentFY.minus({ days: 1 }).endOf('day');
      return { startDate: s(startPrevFY), endDate: s(endPrevFY) };
    }
    default:
      return null;
  }
}

export default function SelectPeriodButtonRN({
  onChange,
  label,
  defaultLabel = '',
  timezone: timezoneProp,
  tzKey = 'tz',
  defaultTimezone = 'America/New_York',
  periods = DEFAULT_PERIODS,
  buttonText = 'Select Period',
  buttonStyle,
  buttonTextStyle,
  modalTitle = 'Choose a period',
  itemStyle,
  itemTextStyle,
}) {
  const { height } = useWindowDimensions();
  const LIST_HEIGHT = useMemo(() => height * 0.5, [height]);

  const [visible, setVisible] = useState(false);
  const [internalLabel, setInternalLabel] = useState(defaultLabel);
  const [customMode, setCustomMode] = useState(false);

  // --- Custom dates: SAME default times as you set in state ---
  const [startDateValue, setStartDateValue] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  const [endDateValue, setEndDateValue] = useState(() => {
    const d = new Date(); d.setHours(23,59,59,999); return d;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [timezone, setTimezone] = useState(() => normalizeZone(timezoneProp ?? defaultTimezone));

  useEffect(() => {
    let mounted = true;
    const loadTZ = async () => {
      try {
        if (timezoneProp) {
          const nz = normalizeZone(timezoneProp);
          if (mounted) setTimezone(nz);
          return;
        }
        const saved = await AsyncStorage.getItem(tzKey);
        const nz = normalizeZone(saved || defaultTimezone);
        if (mounted) setTimezone(nz);
      } catch {
        if (mounted) setTimezone(normalizeZone(defaultTimezone));
      }
    };
    loadTZ();
    return () => { mounted = false; };
  }, [timezoneProp, tzKey, defaultTimezone]);

  const handleSelect = (name) => {
    if (name === 'Custom') {
      setCustomMode(true);
      return;
    }
    const range = computePresetRange(name, timezone);
    if (range) {
      if (label == null) setInternalLabel(name);
      onChange?.({ label: name, startDate: range.startDate, endDate: range.endDate, isCustom: false, timezone });
      setVisible(false);
    }
  };

  // EXACT Custom behavior: copy only Y-M-D into existing times
  const onPickStart = (event, picked) => {
    setShowStartPicker(false);
    if (event.type !== 'set' || !picked) return;
    const newD = new Date(startDateValue);
    newD.setFullYear(picked.getFullYear());
    newD.setMonth(picked.getMonth());
    newD.setDate(picked.getDate());
    setStartDateValue(newD);
  };
  const onPickEnd = (event, picked) => {
    setShowEndPicker(false);
    if (event.type !== 'set' || !picked) return;
    const newD = new Date(endDateValue);
    newD.setFullYear(picked.getFullYear());
    newD.setMonth(picked.getMonth());
    newD.setDate(picked.getDate());
    setEndDateValue(newD);
  };

  const applyCustom = () => {
    const start = formatMs(startDateValue.getTime()); // NO zone passed (matches your convertTimestampToZoneForStartDate)
    const end = formatMs(endDateValue.getTime());
    if (label == null) setInternalLabel('Custom');
    onChange?.({ label: 'Custom', startDate: start, endDate: end, isCustom: true, timezone });
    setCustomMode(false);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={[styles.button, buttonStyle]} onPress={() => setVisible(true)}>
        <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            {!customMode ? (
              <>
                <Text style={styles.title}>{modalTitle}</Text>
                <FlatList
                  data={periods}
                  keyExtractor={(it) => String(it.id)}
                  style={{ maxHeight: LIST_HEIGHT, width: '100%' }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.item, itemStyle]} onPress={() => handleSelect(item.name)}>
                      <Text style={[styles.itemText, itemTextStyle]}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => setVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Custom Range</Text>

                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>From</Text>
                    <TouchableOpacity style={styles.inputLike} onPress={() => setShowStartPicker(true)}>
                      <Text>{formatMs(startDateValue.getTime())}</Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                      <DateTimePicker
                        value={startDateValue}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={onPickStart}
                      />
                    )}
                  </View>

                  <View style={{ width: 8 }} />

                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>To</Text>
                    <TouchableOpacity style={styles.inputLike} onPress={() => setShowEndPicker(true)}>
                      <Text>{formatMs(endDateValue.getTime())}</Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                      <DateTimePicker
                        value={endDateValue}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={onPickEnd}
                      />
                    )}
                  </View>
                </View>

                <View style={[styles.rowBetween, { marginTop: 14 }]}>
                  <TouchableOpacity style={[styles.secondaryBtn]} onPress={() => setCustomMode(false)}>
                    <Text style={[styles.secondaryText]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button]} onPress={applyCustom}>
                    <Text style={styles.buttonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#563C9E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600',textAlign:"center" },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  item: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  itemText: { fontSize: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' },
  label: { fontWeight: '600', marginBottom: 6 },
  inputLike: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#7E81FF' },
  secondaryText: { color: '#7E81FF', fontWeight: '600' },
});
