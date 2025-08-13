import {View, Text, Alert, ScrollView, Platform} from 'react-native';
import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs';
import {WebView} from 'react-native-webview';
import * as XLSX from 'xlsx';
import { Button } from 'react-native-paper';
import Share from 'react-native-share';

export default function ExcelViewer({route}) {
  const shareExcel = async () => {
    const filePath = Platform.OS === 'android'
      ? `${RNFS.DownloadDirectoryPath}/invoice_${invoiceNo}.xlsx`
      : `${RNFS.DocumentDirectoryPath}/invoice_${invoiceNo}.xlsx`;

    try {
      const options = {
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Share Invoice Excel',
        failOnCancel: false,
      };
      await Share.open(options);
    } catch (error) {
      console.error('Error sharing Excel:', error);
      Alert.alert('Error', 'Failed to share Excel file');
    }
  };

  const {invoiceNo} = route.params;
  const [fileName, setFileName] = useState('');
  const [downloadDoc, setDownloadDoc] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const readFiles = async () => {
      try {
        const path =
          Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}`
            : `${RNFS.DocumentDirectoryPath}`;
        const result = await RNFS.readDir(path);
        // console.log('filepath=====>', path);
        // console.log('filepath=====>rr', result);
        const filteredFiles = result.filter(
          file => file.name.includes(invoiceNo) && file.name.endsWith('.xlsx'),
        );

        if (filteredFiles.length > 0) {
          const fil = filteredFiles[0].name;
          setFileName(fil);
          await readExcelAndConvertToHTML(`${path}/${fil}`);
        } else {
          Alert.alert('File Not Found', 'No matching Excel file found.');
        }
      } catch (error) {
        console.error('Error reading files:', error);
      }
    };
    readFiles();
  }, []);

  const readExcelAndConvertToHTML = async filePath => {
    try {
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'Excel file does not exist.');
        return;
      }

      const fileBuffer = await RNFS.readFile(filePath, 'base64');
      const workbook = XLSX.read(fileBuffer, {type: 'base64'});
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1});

      if (jsonData.length === 0) {
        Alert.alert('Error', 'Excel file is empty.');
        return;
      }

      let tableHtml = `
                <html>
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; padding: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { padding: 8px; text-align: center; border: 1px solid black; }
                    th { background-color: rgb(139, 10, 10); color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    tr:first-child { 
                        background-color:rgb(96, 151, 218); /* Yellow background for first row */
                        font-weight: bold; 
                        color: white;
                    }
                </style>
                </head>
                <body>
                
                <table>
            `;

      jsonData.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${cell || '000'}</td>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</table></body></html>';
      // console.log('tableHtml:', tableHtml);
      setHtmlContent(tableHtml);
    } catch (error) {
      Alert.alert('Error', 'Failed to load Excel file.');
      console.error('Error reading Excel file:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={{width: '100%', padding: 16, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 1}}>
        <Button mode="contained" onPress={shareExcel}>
          Share Excel
        </Button>
      </View>
      {/* <Text>{`file://${RNFS.DownloadDirectoryPath}/${fileName}`}</Text> */}
      {htmlContent ? (
        <WebView
          originWhitelist={['*']}
          source={{html: htmlContent}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={e => console.log('WebView Error:', e.nativeEvent)}
          onLoad={() => console.log('WebView Loaded Successfully')}
          onLoadProgress={e =>
            console.log('WebView Loading Progress:', e.nativeEvent)
          }
          style={{flex: 1, width: '100%', height: '100%'}}
        />
      ) : (
        <Text style={{textAlign: 'center', marginTop: 20}}>File Not Found</Text>
      )}
    </View>
  );
}
