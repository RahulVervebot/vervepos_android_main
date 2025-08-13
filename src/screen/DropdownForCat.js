import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
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
  const [currentCatValue, setCurrentCatValue] = useState(value);

  // Update the items based on the checked state
  const updatedTaxesData = useMemo(() => {
    const updateTaxsId = data.map((item) => ({
      ...item,
      checked: taxes_id?.some((tax) => tax.id === item.id) || false,
    }));
    return updateTaxsId;
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

    // Close the modal when an item is selected
    setShowOption(false);
    setSearch('');

    if (isShowCategoriesDropDown) {
      handleSelectedCat();
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
            onPress={() => setShowOption(!showOption)}>
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
            }}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <TextInput
                style={{
                  borderColor: '#3399ff',
                  borderWidth: 1,
                  padding: '3%',
                  marginBottom: '2%',
                  borderRadius: 10,
                  width: '80%',
                  height: '6%',
                  marginTop: '20%',
                  fontSize: 16,
                }}
                placeholderTextColor={'#87c3ff'}
                placeholder={getCurrentCategoryPlaceholder()}
                onChangeText={(val) => setSearch(val)}
                value={search} // Bind the search state to the input value
              />
              <View style={{ maxHeight: '80%' }}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {filteredTaxs
                    ?.filter(
                      (home) =>
                        home.name.includes(search) ||
                        home.name.includes(search.toLowerCase()) ||
                        home.name.includes(search.toUpperCase()),
                    )
                    .map((item, index) => (
                      <TouchableOpacity
                        style={{
                          ...styles.selectedItemStyle,
                          backgroundColor: value?.id === item.id ? 'lightgrey' : 'white',
                        }}
                        onPress={() => {
                          onSelectedItem(item, index);
                        }}
                        key={String(index)}>
                        <Text style={{ fontSize: 21 }}>{item?.name}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    marginHorizontal: '10%',
                    marginVertical: '5%',
                    borderColor: '#ff0000',
                    borderWidth: 0.5,
                    padding: '2%',
                    borderRadius: 20,
                    backgroundColor: '#fff',
                  }}
                  onPress={() => {
                    setShowOption(false);
                    setSearch('');
                  }}>
                  <Text style={{ fontSize: 25, color: '#ff0000', fontWeight: '300' }}>
                    CLOSE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
};

export default DropdownForCat;

const styles = StyleSheet.create({
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
  selectedItemStyle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
