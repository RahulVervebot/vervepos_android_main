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
} from 'react-native';
import React, {useState, useMemo} from 'react';
import imagesPath from '../constants/imagesPath';
import { set } from 'lodash';

const Dropdown = ({selectedItem = {},data = [], Lable, value = {}, onSelect = () => {}, isToggle, taxes_id, isSelectedCategory, isShowCategoriesDropDown, handleSelectedCat}) => {
  // console.log("data", data);
  // console.log('taxsid', taxes_id);
  const [showOption, setShowOption] = useState(false);
  const [search, setSearch] = useState('');
  const [taxIds, setTaxIds] = useState([])
  const onSelectedItem = (val,index) => {
    onSelect(val,index, data);
    setTaxIds([...taxIds, val.name])
  };
  
  const updatedTaxesData = useMemo(
    () => {
      if (Object.keys(selectedItem).length) {

        data.map(e => {
          if (selectedItem?.items[0]?.vendor_name[0] == e.id) {
            // console.log("Vendordata : >> ", e.id, selectedItem?.items[0]?.vendor_name[0])
            return { ...e, checked: true }
          } else {
            return { ...e, checked: false }
          }
        })
      }
      const updateTaxsId = data.map((obj1) => {
        const isExist = taxes_id?.some((obj2) => obj1.id === obj2.id);
        if(isExist) {
          obj1.checked = true
        }
        return obj1
    })
    return updateTaxsId;
    },[data, taxes_id]);
  
  const filteredTaxs = isToggle ? updatedTaxesData : data
  const selectedTaxNames = () => {
    const taxsNames = filteredTaxs.filter((item)=> item.checked).map((selectedItem) => selectedItem.name).join(',')
    if(taxsNames){
      return taxsNames
    }
    return 'PLEASE SELECT'
  }

  const selectedItemName = () => {
    return value?.name ?? 'PLEASE SELECT'
  }

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between',alignItems:'center',}}>
      {!isShowCategoriesDropDown && (<View>
        <Text style={{fontSize: 16,borderColor:'black',borderWidth:0.5,borderRadius:5,paddingTop:5,paddingBottom:5,paddingLeft:3}}>
          {String(Lable)}
        </Text>
      </View>)}
      <View style={{width: '50%',}}>
        {!isShowCategoriesDropDown && (<TouchableOpacity
          activeOpacity={0.5}
          style={styles.dropDownStyle}
          onPress={() => setShowOption(!showOption)}>
          {/* <Text style={{fontSize: 20, textAlign:'center'}}>{ isSelectedCategory ? selectedItemName() : selectedTaxNames()}</Text> */}
           <Text style={{ fontSize:16, }}>
           {isSelectedCategory ? selectedItemName().split(',').map((word, index) => (
        <Text key={index}>{word}{index !== selectedItemName().split(',').length - 1 ? ',\n' : ''}</Text>
         ))
          : selectedTaxNames().split(',').map((word, index) => (
        <Text key={index}>{word}{index !== selectedTaxNames().split(',').length - 1 ? ',\n' : ''}</Text>
          ))}
           </Text>

          <Image
            style={{transform: [{rotate: showOption ? '180deg' : '0deg'}]}}
            source={imagesPath.DropdownIcon}
          />
        </TouchableOpacity>)}

        {showOption && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={showOption}
            onRequestClose={() => {
              setShowOption(!showOption);
            }}>
            <View style={{width: '100%', alignItems: 'center',justifyContent:'space-between'}}>
              <TextInput
                style={{
                  borderColor: '#3399ff',
                  borderWidth: 1,
                  padding: '3%',
                  // marginBottom: '2%',
                  borderRadius: 10,
                  width: '80%',
                  height: 50,
                  marginTop: '20%',
                  fontSize: 20,
                }}
                placeholderTextColor={'#87c3ff'}
                placeholder={`SEARCH`}
                onChangeText={val => setSearch(val)}
              />
              <View style={{maxHeight: '80%',width:'80%'}}>
              <ScrollView keyboardShouldPersistTaps="handled">
                  {filteredTaxs
                    ?.filter(
                      home =>
                        home.name.includes(search) ||
                        home.name.includes(search.toLowerCase()) ||
                        home.name.includes(search.toUpperCase()),
                    )
                    .map((item, index) => {
                      return (
                        <TouchableOpacity
                          style={{
                            ...styles.selectedItemStyle,
                            backgroundColor:
                              value?.id == item.id ? 'grey' : 'white',
                          }}
                          onPress={() => {
                            onSelectedItem(item,index);
                            setSearch('');
                            if(isShowCategoriesDropDown){
                              handleSelectedCat()
                            }
                            setShowOption(!showOption);
                            
                          }}
                          key={String(index)}>
                          <Text style={{fontSize: 21}}>{item?.name}</Text>
                          {isToggle && <Switch
                        color="#6495ed"
                        ios_backgroundColor="#3e3e3e"
                        value={item.checked}
                        onValueChange={e=>onSelectedItem(item,index)}
                      />}
                        </TouchableOpacity>
                      );
                    })}
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
                    setShowOption(!showOption);
                    setSearch('');
                    // if(isShowCategoriesDropDown){
                    //   handleSelectedCat()
                    // }
                  }}>
                  <Text
                    style={{fontSize: 25, color: '#ff0000', fontWeight: '300'}}>
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

export default Dropdown;

const styles = StyleSheet.create({
  dropDownStyle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    minHeight: 32,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'red'
  },

  selectedItemStyle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});