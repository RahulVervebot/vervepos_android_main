import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';

const ICON_SIZE = 50;
const BORDER_SIZE = 0;

/* ---------- checksum helper ---------- */
const isValidUPC = (barcode) => {
  if (!barcode.startsWith('0') || barcode.length !== 12) return false;
  const digits = barcode.slice(1).split('').map(Number);

  let sumOdd = 0;
  let sumEven = 0;
  for (let i = 0; i < 11; i++) {
    if (i % 2 === 0) sumOdd += digits[i];
    else sumEven += digits[i];
  }
  const check = (10 - ((sumOdd * 3 + sumEven) % 10)) % 10;
  return check === digits[10];
};
/* ------------------------------------- */

const Barcode = () => {
  const navigation = useNavigation();

  const [torchOn, setTorchOn] = useState(false);
  const [alreadyShown, setAlreadyShown] = useState(false);

  /* handle decoded barcode from CameraKit */
  const handleBarcode = useCallback(
    (e) => {
    // console.log('e', e);
    const code = e.nativeEvent.codeStringValue  
      const codeType = e.nativeEvent.codeType;
      console.log('value', code, 'type', codeType);
  
      // 1️⃣ If type says QR → skip
      if (codeType === 'QR_CODE') return;
      if (!codeType && /^(https?:\/\/|www\.)/i.test(code)) return;  
    // if (codeType === 'QR_CODE') return;      // skip QR
    if (alreadyShown) return;

      const finalCode = isValidUPC(code) ? code.slice(1) : code;
      navigation.replace('ProductInformation', { barcode: finalCode });
      setAlreadyShown(true);
    },
    [alreadyShown, navigation]
  );

  /* marker overlay (green corners) */
  const marker = (
    <View
      style={{
        width: '70%',
        height: '30%',
        justifyContent: 'center',
        marginBottom: '75%',
      }}
    >
      {['tl', 'tr', 'bl', 'br'].map((k) => {
        const s = {
          position: 'absolute',
          width: 24,
          height: 24,
          borderColor: 'yellow',
          borderStyle: 'solid',
          borderRadius: 5,
          zIndex: 1,
        };
        if (k === 'tl') Object.assign(s, { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 });
        if (k === 'tr') Object.assign(s, { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 });
        if (k === 'bl') Object.assign(s, { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 });
        if (k === 'br') Object.assign(s, { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 });
        return <View key={k} style={s} />;
      })}
    </View>
  );


  return (
    <View style={styles.container}>

        <Camera
            scanBarcode={true}
            onReadCode={(e) => handleBarcode(e)} // optional
            // onReadCode={(e) => handleBarcode(e.nativeEvent.codeStringValue)} // optional
            cameraType={CameraType.Back} // (default is back) optional
            showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner, that stops when a code has been found. Frame always at center of the screen
            laserColor='red' // (default red) optional, color of laser in scanner frame
            frameColor='white' // (default white) optional, color of border of scanner frame
            style={styles.cameraContainer}
            torchMode={torchOn ? 'on' : 'off'}
        />

      <TouchableOpacity style={styles.torch} onPress={() => setTorchOn((t) => !t)}>
        <Image
          style={styles.flash}
          source={
            torchOn
              ? require('../../src/images/icons8-flash-off-90.png')
              : require('../../src/images/icons8-flash-on-90.png')
          }
        />
      </TouchableOpacity>

    
      <CloseButton style={styles.close} onPress={() => navigation.navigate('Product')}>
        <Text style={styles.txtclose}>❌</Text>
      </CloseButton>
    </View>
  );
};

export default Barcode;

/* ---------- styles ---------- */
const CloseButton = styled.TouchableOpacity`
  background-color: white;
  width: ${ICON_SIZE + BORDER_SIZE}px;
  height: ${ICON_SIZE + BORDER_SIZE}px;
  border-radius: ${(ICON_SIZE + BORDER_SIZE) / 2}px;
  border-width: ${BORDER_SIZE}px;
  marginbottom: 50px;
`;

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { flex: 1 },
  torch: {
    position: 'absolute',
    right: 15,
    top: 60,
    zIndex: 2,
  },
  close: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 40,
  },
  flash: { height: 25, width: 30, tintColor: '#fff' },
  txtclose: { color: 'red', padding: 15, textAlign: 'center' },
});
