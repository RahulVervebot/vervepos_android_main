// import React from "react";
// import { View, Modal, Text } from "react-native";
// import SelectDropdown from 'react-native-select-dropdown'
// import ProductInformation from "../screen/ProductInformation";

// function CategoryDropDown() {
//     const emojisWithIcons = [
//         {title: 'happy' },
//         {title: 'cool'},
//         {title: 'lol' },
//         {title: 'sad' },
//         {title: 'cry'},
//         {title: 'angry' },
//         {title: 'confused'},
//         {title: 'excited'}
//       ];

// return (
//     <View style={{ flex: 1 }}>
//         <SelectDropdown
//     data={emojisWithIcons}
//     onSelect={(selectedItem, index) => {
//       console.log(selectedItem, index);
//     }}
//     renderButton={(selectedItem, isOpened) => {
//       return (
//         <View style={Styles.dropdownButtonStyle}>
//           {selectedItem && (
//             <Icon name={selectedItem.title} style={Styles.dropdownButtonIconStyle} />
//           )}
//           <Text style={Styles.dropdownButtonTxtStyle}>
//             {(selectedItem && selectedItem.title) || 'Select your mood'}
//           </Text>
//           {/* <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={Styles.dropdownButtonArrowStyle} /> */}
//         </View>
//       );
//     }}
//     renderItem={(item, index, isSelected) => {
//       return (
//         <View style={{...Styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
//           <Icon name={item.title} style={Styles.dropdownItemIconStyle} />
//           <Text style={Styles.dropdownItemTxtStyle}>{item.title}</Text>
//         </View>
//       );
//     }}
//     showsVerticalScrollIndicator={false}
//     dropdownStyle={Styles.dropdownMenuStyle}
//   />
//      </View>
//  )
//  };
// export default CategoryDropDown;

// const Styles = StyleSheet.create({
//   dropdownButtonStyle: {
//     width: 200,
//     height: 50,
//     backgroundColor: '#E9ECEF',
//     borderRadius: 12,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//   },
//   dropdownButtonTxtStyle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#151E26',
//   },
//   dropdownButtonArrowStyle: {
//     fontSize: 28,
//   },
//   dropdownButtonIconStyle: {
//     fontSize: 28,
//     marginRight: 8,
//   },
//   dropdownMenuStyle: {
//     backgroundColor: '#E9ECEF',
//     borderRadius: 8,
//   },
//   dropdownItemStyle: {
//     width: '100%',
//     flexDirection: 'row',
//     paddingHorizontal: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dropdownItemTxtStyle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#151E26',
//   },
//   dropdownItemIconStyle: {
//     fontSize: 28,
//     marginRight: 8,
//   },
// });

