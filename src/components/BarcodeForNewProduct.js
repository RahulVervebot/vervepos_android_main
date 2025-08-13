import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import styled from 'styled-components/native';

import {
  Camera,            // main camera view
  CameraType,
  FlashMode,
} from 'react-native-camera-kit';

const ICON_SIZE = 50;
const BORDER_SIZE = 0;

const BarcodeForNewProduct = ({ onBarcodeFound = () => {}, onBarcodeCancel = () => {} }) => {
  const [torchOn, setTorchOn]   = useState(false);
  const [alreadyShown, setHit]  = useState(false);

  /* --- helpers --- */
  const handleBarcode = useCallback(
    (e) => {
      if (alreadyShown) return;
      const value = e.nativeEvent.codeStringValue;
      const codeType = e.nativeEvent.codeType;
      console.log('value', value, 'type', codeType);
  
      // 1️⃣ If type says QR → skip
      if (codeType === 'QR_CODE') return;
      if (!codeType && /^(https?:\/\/|www\.)/i.test(value)) return;
      onBarcodeFound(value);        // pass up
      setHit(true);                 // block further reads until screen unmounts
    },
    [alreadyShown, onBarcodeFound],
  );

  const marker = (
    <View style={{ width: '70%', height: '30%', justifyContent: 'center', marginBottom: '75%' }}>
      {['tl','tr','bl','br'].map((k) => {
        const s = {
          position: 'absolute',
          width: 24,
          height: 24,
          borderColor: 'yellow',
          borderStyle: 'solid',
          borderRadius: 5,
          zIndex: 1,
        };
        if (k === 'tl') Object.assign(s, { top: -2, left: -2,  borderTopWidth: 4, borderLeftWidth: 4 });
        if (k === 'tr') Object.assign(s, { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 });
        if (k === 'bl') Object.assign(s, { bottom: -2, left: -2,borderBottomWidth: 4, borderLeftWidth: 4 });
        if (k === 'br') Object.assign(s, { bottom: -2, right: -2,borderBottomWidth: 4, borderRightWidth: 4 });
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

      {/* torch toggle */}
      <TouchableOpacity style={styles.torch} onPress={() => setTorchOn(t => !t)}>
        <Image
          style={styles.flash}
          source={
            torchOn
              ? require('../../src/images/icons8-flash-off-90.png')
              : require('../../src/images/icons8-flash-on-90.png')
          }
        />
      </TouchableOpacity>

      {/* close button */}
      <CloseButton style={styles.close} onPress={() => onBarcodeCancel('cancel')}>
        <Text style={styles.txtclose}>❌</Text>
      </CloseButton>
    </View>
  );
};

export default BarcodeForNewProduct;

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
