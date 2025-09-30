import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import imagesPath from '../constants/imagesPath';

const DropdownForCat = ({
  multiSelection = true,
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
  const [currentCatValue] = useState(value);

  // Update items based on checked state
  const updatedTaxesData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      checked: taxes_id?.some((tax) => tax.id === item.id) || false,
    }));
  }, [data, taxes_id]);

  const filteredTaxs = useMemo(() => {
    return isToggle ? updatedTaxesData : data;
  }, [updatedTaxesData, isToggle]);

  const onSelectedItem = (val, index) => {
    const updatedData = filteredTaxs.map((item, idx) => ({
      ...item,
      checked: idx === index ? !item.checked : multiSelection ? item.checked : false,
    }));

    onSelect(val, index, updatedData);

    setShowOption(false);
    setSearch('');

    if (isShowCategoriesDropDown) {
      handleSelectedCat?.();
    }
  };

  const getCurrentCategoryPlaceholder = () => {
    return `Active Cat.: ${currentCatValue ?? 'None'}`;
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 30, marginTop: -8, width: 130 }}>
      <View style={{ width: '120%', marginTop: 0, alignItems: 'flex-end', marginRight: -10, height: 30 }}>
        {!isShowCategoriesDropDown && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={{ marginTop: -15 }}
            onPress={() => setShowOption(!showOption)}
          >
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
            presentationStyle="fullScreen"
            onRequestClose={() => {
              setShowOption(false);
              setSearch('');
            }}
          >
            <SafeAreaView style={styles.modalContainer}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 24 })}
                style={styles.modalWrap}
              >
                <TextInput
                  style={styles.searchInput}
                  placeholderTextColor="#000"
                  placeholder={getCurrentCategoryPlaceholder()}
                  onChangeText={setSearch}
                  value={search}
                />

                <View style={styles.listWrap}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                  >
                    {filteredTaxs
                      ?.filter((home) => {
                        const q = search.trim().toLowerCase();
                        if (!q) return true;
                        return home?.name?.toLowerCase()?.includes(q);
                      })
                      .map((item, index) => (
                        <TouchableOpacity
                          style={[
                            styles.selectedItemStyle,
                            { backgroundColor: value?.id === item.id ? 'lightgrey' : 'white' },
                          ]}
                          onPress={() => onSelectedItem(item, index)}
                          key={String(index)}
                        >
                          <Text style={styles.itemText}>{item?.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => {
                      setShowOption(false);
                      setSearch('');
                    }}
                  >
                    <Text style={styles.closeBtnText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Modal>
        )}
      </View>
    </View>
  );
};

export default DropdownForCat;

const styles = StyleSheet.create({
  // existing base style you had
  dropDownStyle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    minHeight: 32,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  // fixed list item
  selectedItemStyle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 21,
  },

  // NEW styles for modal & input (kept in same file)
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    borderColor: '#3399ff',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10, // numeric padding to avoid shrink
    marginBottom: 12,
    borderRadius: 10,
    width: '90%',
    height: 48, // fixed height prevents shrinking
    fontSize: 16,
    backgroundColor: '#fff',
  },
  listWrap: {
    flex: 1, // use flex instead of maxHeight %
    width: '100%',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  closeBtn: {
    alignItems: 'center',
    marginHorizontal: '10%',
    marginVertical: 12,
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
