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
import React, {useState, useMemo} from 'react';
import imagesPath from '../constants/imagesPath';

const Dropdown = ({
  selectedItem = {},
  data = [],
  Lable,
  value = {},
  onSelect = () => {},
  isToggle,
  taxes_id,
  isSelectedCategory,
  isShowCategoriesDropDown,
  handleSelectedCat,
}) => {
  const [showOption, setShowOption] = useState(false);
  const [search, setSearch] = useState('');
  const [taxIds, setTaxIds] = useState([]);

  const onSelectedItem = (val, index) => {
    // ⬇️ keep old behavior exactly
    onSelect(val, index, data);
    setTaxIds([...taxIds, val.name]);
  };

  // ===== derive checked flags (keep as you had it) =====
  const updatedTaxesData = useMemo(() => {
    if (Object.keys(selectedItem).length) {
      data.map(e => {
        if (selectedItem?.items[0]?.vendor_name[0] == e.id) {
          return {...e, checked: true};
        } else {
          return {...e, checked: false};
        }
      });
    }
    const updateTaxsId = data.map(obj1 => {
      const isExist = taxes_id?.some(obj2 => obj1.id === obj2.id);
      if (isExist) {
        obj1.checked = true;
      }
      return obj1;
    });
    return updateTaxsId;
  }, [data, taxes_id]);

  // ===== improved, case-insensitive search (name, display_name, id) =====
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

  const selectedTaxNames = () => {
    const taxsNames = filteredTaxs
      .filter(item => item.checked)
      .map(selectedItem => selectedItem.name)
      .join(',');
    if (taxsNames) {
      return taxsNames;
    }
    return 'PLEASE SELECT';
  };

  const selectedItemName = () => {
    return value?.name ?? 'PLEASE SELECT';
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
      <View style={{width: '50%'}}>
        {!isShowCategoriesDropDown && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.dropDownStyle}
            onPress={() => setShowOption(!showOption)}>
            <Text style={{fontSize: 16}}>
              {isSelectedCategory
                ? selectedItemName()
                    .split(',')
                    .map((word, index) => (
                      <Text key={index}>
                        {word}
                        {index !== selectedItemName().split(',').length - 1
                          ? ',\n'
                          : ''}
                      </Text>
                    ))
                : selectedTaxNames()
                    .split(',')
                    .map((word, index) => (
                      <Text key={index}>
                        {word}
                        {index !== selectedTaxNames().split(',').length - 1
                          ? ',\n'
                          : ''}
                      </Text>
                    ))}
            </Text>

            <Image
              style={{transform: [{rotate: showOption ? '180deg' : '0deg'}]}}
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
              setShowOption(!showOption);
              setSearch('');
            }}>
            {/* KeyboardAvoidingView to prevent shrinking */}
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
                  {filteredTaxs?.map((item, index) => {
                    return (
                      <TouchableOpacity
                        style={{
                          ...styles.selectedItemStyle,
                          backgroundColor:
                            value?.id == item.id ? 'lightgrey' : 'white',
                        }}
                        onPress={() => {
                          onSelectedItem(item, index); // keep old behavior
                          setSearch('');
                          if (isShowCategoriesDropDown) {
                            handleSelectedCat && handleSelectedCat();
                          }
                          setShowOption(!showOption);
                        }}
                        key={String(index)}>
                        <Text style={{fontSize: 21}}>
                          {item?.name ?? item?.display_name ?? '(no name)'}
                        </Text>

                        {isToggle && (
                          <Switch
                            color="#6495ed"
                            ios_backgroundColor="#3e3e3e"
                            value={!!item.checked}
                            onValueChange={() => onSelectedItem(item, index)} // keep old behavior
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {!filteredTaxs?.length && (
                    <Text style={styles.empty}>No matches</Text>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setShowOption(!showOption);
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
    minHeight: 40, // fixed height prevents shrink
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 0.5,
    backgroundColor: '#fff',
  },

  // NEW modal/layout styles (no % heights)
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
    paddingVertical: 10, // numeric padding to avoid shrinking
    borderRadius: 10,
    width: '90%',
    height: 48, // fixed height so it doesn't collapse
    fontSize: 16,
    backgroundColor: '#fff',
  },

  listWrap: {
    flex: 1, // take remaining space (instead of maxHeight:'80%')
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
