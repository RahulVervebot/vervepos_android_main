import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import imagesPath from '../constants/imagesPath';

const normalizeIdsToSet = (list) => {
  if (!Array.isArray(list)) return new Set();
  return new Set(list.map(t => (typeof t === 'object' ? t.id : t)).filter(v => v != null));
};

const Dropdown = ({
  selectedItem = {},
  data = [],
  Lable,
  value = {},
  onSelect = () => {},
  isToggle,
  taxes_id, // can be [id] or [{id}]
  isSelectedCategory,
  isShowCategoriesDropDown,
  handleSelectedCat,
}) => {
  const [showOption, setShowOption] = useState(false);
  const [search, setSearch] = useState('');

  // === Local controlled state for toggle mode ===
  const [checkedIds, setCheckedIds] = useState(() => normalizeIdsToSet(taxes_id));

  // Sync down from props when taxes_id changes externally
  useEffect(() => {
    setCheckedIds(normalizeIdsToSet(taxes_id));
  }, [taxes_id]);

  const selectedIdFromSingle =
    selectedItem?.items?.[0]?.vendor_name?.[0] ?? null;

  // Build view data without mutating source
  const updatedTaxesData = useMemo(() => {
    return (data ?? []).map(e => {
      const isChecked = isToggle
        ? checkedIds.has(e.id) // multi-select uses local set
        : selectedIdFromSingle === e.id; // single-select visual
      return { ...e, checked: !!isChecked };
    });
  }, [data, isToggle, checkedIds, selectedIdFromSingle]);

  // Search (case-insensitive)
  const filteredTaxs = useMemo(() => {
    const src = isToggle ? updatedTaxesData : data;
    const q = search.trim().toLowerCase();
    if (!q) return src;
    return src.filter(home => {
      const name = (home?.name ?? '').toLowerCase();
      const display = (home?.display_name ?? '').toLowerCase();
      const idStr = String(home?.id ?? '').toLowerCase();
      return name.includes(q) || display.includes(q) || idStr.includes(q);
    });
  }, [updatedTaxesData, data, isToggle, search]);

  const selectedTaxNames = useMemo(() => {
    const names = (updatedTaxesData ?? [])
      .filter(i => i.checked)
      .map(i => i.name)
      .filter(Boolean);
    return names.length ? names.join(',') : 'PLEASE SELECT';
  }, [updatedTaxesData]);

  const selectedItemName = () => value?.name ?? 'PLEASE SELECT';

  // === Toggle handler (local state) ===
  const toggleCheck = (item, index) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      // still call onSelect to keep backward compatibility
      // (parent can ignore extra argument; we pass the new list too)
      const nextList = Array.from(next);
      try {
        onSelect({ ...item, checked: next.has(item.id) }, index, data, nextList);
      } catch (e) {
        // no-op if parent expects only 3 args
        onSelect({ ...item, checked: next.has(item.id) }, index, data);
      }
      return next;
    });
  };

  const handleRowPress = (item, index) => {
    if (isToggle) {
      // In toggle mode, do NOT close the modal – just flip the switch
      toggleCheck(item, index);
    } else {
      // Keep old single-select behavior
      onSelect(item, index, data);
      setSearch('');
      if (isShowCategoriesDropDown) {
        handleSelectedCat && handleSelectedCat();
      }
      setShowOption(false);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      {!isShowCategoriesDropDown && (
        <View>
          <Text
            style={{
              fontSize: 16,
              borderColor: 'black',
              borderWidth: 0.5,
              borderRadius: 5,
              paddingTop: 5,
              paddingBottom: 5,
              paddingLeft: 3,
            }}>
            {String(Lable)}
          </Text>
        </View>
      )}
      <View style={{ width: '50%' }}>
        {!isShowCategoriesDropDown && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.dropDownStyle}
            onPress={() => setShowOption(!showOption)}>
            <Text style={{ fontSize: 16 }}>
              {isSelectedCategory
                ? selectedItemName()
                    .split(',')
                    .map((word, index, arr) => (
                      <Text key={index}>
                        {word}
                        {index !== arr.length - 1 ? ',\n' : ''}
                      </Text>
                    ))
                : selectedTaxNames
                    .split(',')
                    .map((word, index, arr) => (
                      <Text key={index}>
                        {word}
                        {index !== arr.length - 1 ? ',\n' : ''}
                      </Text>
                    ))}
            </Text>

            <Image
              style={{ transform: [{ rotate: showOption ? '180deg' : '0deg' }] }}
              source={imagesPath.DropdownIcon}
            />
          </TouchableOpacity>
        )}

        {showOption && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={showOption}
            onRequestClose={() => {
              setShowOption(false);
              setSearch('');
            }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalWrap}>
              <TextInput
                style={styles.searchInput}
                placeholderTextColor={'#87c3ff'}
                placeholder="SEARCH"
                onChangeText={val => setSearch(val)}
                value={search}
              />

              <View style={styles.listWrap}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.listContent}>
                  {filteredTaxs?.map((item, index) => (
                    <TouchableOpacity
                      style={{
                        ...styles.selectedItemStyle,
                        backgroundColor:
                          (!isToggle && value?.id == item.id) ? 'lightgrey' : 'white',
                      }}
                      onPress={() => handleRowPress(item, index)}
                      key={String(item.id ?? index)}>
                      <Text style={{ fontSize: 21 }}>
                        {item?.name ?? item?.display_name ?? '(no name)'}
                      </Text>

                      {isToggle && (
                        <Switch
                          ios_backgroundColor="#3e3e3e"
                          value={!!item.checked}
                          onValueChange={() => toggleCheck(item, index)}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                  {!filteredTaxs?.length && (
                    <Text style={styles.empty}>No matches</Text>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setShowOption(false);
                    setSearch('');
                  }}>
                  <Text style={styles.closeBtnText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </View>
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  dropDownStyle: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 0.5,
    backgroundColor: '#fff',
  },
  modalWrap: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    borderColor: '#3399ff',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    width: '90%',
    height: 48,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  listWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 16,
    width: '90%',
  },
  selectedItemStyle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 24,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 8,
    borderColor: '#ff0000',
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  closeBtnText: {
    fontSize: 20,
    color: '#ff0000',
    fontWeight: '500',
  },
});
