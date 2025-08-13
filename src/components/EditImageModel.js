import React from "react";
import { View, Modal, Text } from "react-native";
import SelectDropdown from 'react-native-select-dropdown'

function EditImageModel({ setPrintTextColor, setSelectedFontStyle }) {

    const colors = [
        { color: 'black' },
        { color: 'pink' },
        { color: 'fuchsia' },
        { color: 'red' },
        { color: 'teal' },
        { color: 'yellow' },
        { color: 'blue' },
        { color: 'skyblue' },
        { color: 'green' }
    ]
    const fontStyles = [
        { Style: 'italic' },
        { Style: 'bold' },
        { Style: 'normal' }
    ]

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5, }}>
                <View style={{ backgroundColor: 'white', borderRadius: 10, borderWidth: 0.5, borderColor: 'grey', width: '35%', alignSelf: 'center' }}>
                    <SelectDropdown
                        data={colors}
                        onSelect={(selectedItem) => {
                            setPrintTextColor(selectedItem.color);
                        }}
                        renderButton={(selectedItem) => {
                            const selectedColor = selectedItem ? selectedItem.color : setPrintTextColor.highlightHeading_color;
                            return (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#151E26', padding: 10 }}>
                                        {selectedColor || colors[0].color}
                                    </Text>
                                </View>
                            );
                        }}
                        renderItem={(item, isSelected) => {
                            return (
                                <View style={{
                                    width: '100%', borderBottomColor: 'grey', borderBottomWidth: 0.3,
                                    flexDirection: 'row',
                                    paddingHorizontal: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 10, ...(isSelected && { backgroundColor: '#D2D9DF' })
                                }}>
                                    <Text style={{
                                        flex: 1,
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#151E26'
                                    }}>{item.color}</Text>
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={{ backgroundColor: '#D2D9DF', borderRadius: 8,paddingBottom:20, }}
                    />
                </View>

                <View style={{ backgroundColor: 'white', borderRadius: 10, borderWidth: 0.5, borderColor: 'grey', width: '35%', alignSelf: 'center' }}>
                    <SelectDropdown
                        data={fontStyles}
                        onSelect={(selectedItem) => {
                            setSelectedFontStyle(selectedItem.Style)
                        }}
                        renderButton={(selectedItem) => {
                            const selectedFontStyle = selectedItem ? selectedItem.Style : setSelectedFontStyle.highlightHeading_fontStyle;
                            return (
                                <View style={{
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#151E26', padding: 10 }}>
                                        {selectedFontStyle || fontStyles[0].Style}
                                    </Text>
                                </View>
                            );
                        }}
                        renderItem={(item, isSelected) => {
                            return (
                                <View style={{
                                    width: '100%', borderBottomColor: 'grey', borderBottomWidth: 0.3,
                                    flexDirection: 'row',
                                    paddingHorizontal: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 10, ...(isSelected && { backgroundColor: '#D2D9DF' })
                                }}>
                                    <Text style={{
                                        flex: 1,
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#151E26'
                                    }}>{item.Style}</Text>
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={{ backgroundColor: '#E9ECEF', borderRadius: 8, }}
                    />
                </View>
            </View>
        </View>
    )
}

export default EditImageModel;