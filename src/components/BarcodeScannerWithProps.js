import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';

const ICON_SIZE = 50;
const BORDER_SIZE = 0;

/* checksum helpers stay the same */
const calculateChecksum = (barcode) => {
  let sum = 0;
  for (let i = 0; i < barcode.length; i++) {
    const d = parseInt(barcode[i], 10);
    sum += i % 2 === barcode.length % 2 ? d * 3 : d;
  }
  return sum % 10 === 0;
};
const isValidUPC = (b) => b.length === 12 && calculateChecksum(b);

const BarcodeScannerWithProps = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [torchOn, setTorchOn] = useState(false);
  const [alreadyShown, setShown] = useState(false);

  const handleBarcode = useCallback(
    (code) => {
      if (alreadyShown) return;
      let finalCode = code;
      if (code.startsWith('0') && isValidUPC(code.slice(1))) {
        finalCode = code.slice(1);
      }
      route.params.onBarcodeScanned(finalCode);
      navigation.goBack();
      setShown(true);
    },
    [alreadyShown, navigation, route.params]
  );

  /* simple frame marker (green corners) */
  const customMarker = (
    <View
      style={{
        width: '70%',
        height: '30%',
        justifyContent: 'center',
        marginBottom: '75%',
      }}
    >
      {['tl', 'tr', 'bl', 'br'].map((k) => {
        const base = {
          position: 'absolute',
          width: 24,
          height: 24,
          borderColor: 'green',
          borderStyle: 'solid',
          borderRadius: 5,
          zIndex: 1,
        };
        if (k === 'tl') Object.assign(base, { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 });
        if (k === 'tr') Object.assign(base, { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 });
        if (k === 'bl') Object.assign(base, { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 });
        if (k === 'br') Object.assign(base, { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 });
        return <View key={k} style={base} />;
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <CameraScreen
        scanBarcode
        onReadCode={(e) => handleBarcode(e.nativeEvent.codeStringValue)}
        showFrame={false}    
        cameraRatioOverlayColor="transparent"
        customMarker={customMarker}
        torchMode={torchOn ? 'on' : 'off'}
        laserColor="red"
        frameColor="white"
        hideControls={true}
        style={styles.cameraContainer}
      /> */}

      <Camera
          scanBarcode={true}
          onReadCode={(e) => handleBarcode(e.nativeEvent.codeStringValue)} // optional
          cameraType={CameraType.Back} // (default is back) optional
          showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner, that stops when a code has been found. Frame always at center of the screen
          laserColor='red' // (default red) optional, color of laser in scanner frame
          frameColor='white' // (default white) optional, color of border of scanner frame
          style={styles.cameraContainer}
          torchMode={torchOn ? 'on' : 'off'}
      />

      {/* torch toggle */}
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

      {/* close button */}
      <CloseButton style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.txtclose}>❌</Text>
      </CloseButton>
    </View>
  );
};

export default BarcodeScannerWithProps;

/* ---------- styling ---------- */
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
