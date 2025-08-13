import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import React, { useEffect, useState } from 'react'
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';
import { Button } from 'react-native-paper';
import Share from 'react-native-share';

const PDFViewer = ({route}) => {
    const sharePDF = async () => {
        const filePath = Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}/invoice_${invoiceNo}.pdf`
            : `${RNFS.DocumentDirectoryPath}/invoice_${invoiceNo}.pdf`;

        try {
            const options = {
                url: `file://${filePath}`,
                type: 'application/pdf',
                title: 'Share Invoice PDF',
                failOnCancel: false,
            };
            await Share.open(options);
        } catch (error) {
            console.error('Error sharing PDF:', error);
        }
    };

    const {invoiceNo} = route.params;
    const [fileName,setFileName] = useState('')
    const [downloadDoc,setDownloadDoc] = useState([]);
   
  
    useEffect(() => {
        const readFiles = async () => {
          try {
           // Change to the desired directory
            const path =
              Platform.OS === 'android'
                ? `${RNFS.DownloadDirectoryPath}`
                : `${RNFS.DocumentDirectoryPath}`;
            const result = await RNFS.readDir(path); // Get file list
            // console.log("filepath=====>",path)
            // console.log("filepath=====>r",RNFS);
            // console.log("filepath=====>rr",result);
            setDownloadDoc(result.map(file => file.name)); // Extract file names
            setFileName(result.map(file => file.name).filter(file => (file.includes(invoiceNo)) &&(file.includes(".pdf")) )); // Extract file names
          } catch (error) {
            console.error('Error reading files:', error);
          }
        };
    
        readFiles();
      }, []);
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={sharePDF}>
          Share PDF
        </Button>
      </View>
      {/* <Text>{`file://${RNFS.DocumentDirectoryPath}/${fileName}`}</Text> */}
      {fileName.length>0 ? (
        <Pdf
          source={{
            uri: `file://${RNFS.DocumentDirectoryPath}/${fileName}`,
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={error => {
            console.log(error);
          }}
          onPressLink={uri => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />
      ) : <Text>File Not Found</Text>}
    </View>
  );
}


export default PDFViewer



// packagingOptions {
//       pickFirst 'lib/x86/libc++_shared.so'
//       pickFirst 'lib/x86_64/libjsc.so'
//       pickFirst 'lib/arm64-v8a/libjsc.so'
//       pickFirst 'lib/arm64-v8a/libc++_shared.so'
//       pickFirst 'lib/x86_64/libc++_shared.so'
//       pickFirst 'lib/armeabi-v7a/libc++_shared.so'
//     }

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
