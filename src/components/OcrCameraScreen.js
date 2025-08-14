import React, { useRef, useState, useEffect,useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Text, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import SearchTableComponent from './SearchORCTable';
import SaveInvoiceModal from './SaveInvoiceModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import OCRPreviewComponent from './OCRPreviewComponent';
const OcrScreen = ({ navigation }) => {

  const cameraRef = useRef(null);
         const [selectedImage, setSelectedImage] = useState(null);
         const [modalVisible, setModalVisible] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerate, setIsGenerate] = useState(false);
  const [isResponseImg, setIsResponseImg] = useState(false);
  // Dropdown-related
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedDatabaseName, setSelectedDatabaseName] = useState('');
  const [selectedVendorSlug, setSelectedVendorSlug] = useState('');
  // Holds an array of { uri, base64 } for each snapped photo
  const [snappedImages, setSnappedImages] = useState([]);
  // Holds all OCR JSON results before generating the invoice
  const [allocrJsons, setOcrJsons] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false); // State for modal visibility
  const [ocrurl, setOcrUrl] = useState(null);
      const [ocruploadstore, setOcrUploadStore] = useState(null);
  // Holds the filenames returned by the server from the upload
  const [uploadedFilenames, setUploadedFilenames] = useState([]);
  const [uploadedImageURLs, setUploadedImageURLs] = useState([]);

  // Table data after invoice generation
  const [tableData, setTableData] = useState([]);

  // Camera visibility
  const [showCamera, setShowCamera] = useState(false);

  // ============================== USE EFFECT ==============================
  useEffect(() => {
    const fetchInitialData = async () => {
    const temocrurl = await AsyncStorage.getItem('ocrurl');
    const temocruploadstore = await AsyncStorage.getItem('ocruploadstore');
    setOcrUploadStore(temocruploadstore);
    setOcrUrl(temocrurl);
    // Fetch data from your endpoint
    fetch(`${temocrurl}/api/getinvoicelist`)
      .then((res) => res.json())
      .then((data) => {
        const cleanedData = data.filter(
          (item) => item && typeof item.value === "string"
        );
        
        const sortedData = cleanedData.sort((a, b) => a.value.localeCompare(b.value));
      //  const sortedData = data.sort((a, b) => a.value.localeCompare(b.value));
        setInvoiceList(sortedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching invoice list:', error);
        setIsLoading(false);
      });
    }
    fetchInitialData();
  }, []);

  // ============================== PICKER HANDLER ==============================
  const handleValueChange = (itemValue) => {
    setSelectedValue(itemValue);
    const selectedItem = invoiceList.find((item) => item.value === itemValue);
    if (selectedItem) {
      setSelectedDatabaseName(selectedItem.databaseName);
      setSelectedVendorSlug(selectedItem.slug);
    } else {
      setSelectedDatabaseName('');
      setSelectedVendorSlug('');
    }
  };

  // ============================== CAMERA HANDLERS ==============================
  const handleOpenCamera = () => {
    setShowCamera(true);
    setIsResponseImg(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const snapPhoto = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        setSnappedImages((prev) => [...prev, { uri: data.uri, base64: data.base64 }]);
      } catch (err) {
        console.warn('Error snapping photo:', err);
      }
    }
  };

  // ============================== MAIN UPLOAD + GENERATE HANDLER ==============================

  const handleSave = async () => {
    // 1) Validate vendor selection
    if (!selectedValue) {
      Alert.alert(
        'Select Vendor',
        'Please select a vendor from the dropdown before generating an invoice.'
      );
      return;
    }

    // 2) Validate that we have images
    if (!snappedImages.length) {
      Alert.alert('No images', 'Please snap at least one photo first.');
      return;
    }

    try {
      setIsGenerate(true);
      // Clear old filenames + OCR JSON from previous runs
      setUploadedFilenames([]);
      setOcrJsons([]);

      // 3) Upload each image and collect filenames
      const newFilenames = [];
      const newImageURLs = [];
      for (let i = 0; i < snappedImages.length; i++) {
        const img = snappedImages[i];
        const formData = new FormData();
        formData.append('file', {
          uri: img.uri,
          type: 'image/jpeg',
      //    name: `snapped-image-${i}.jpg`,
          name: `${selectedDatabaseName},jpg`,
        });

        // Make the POST request
        const uploadResponse = await fetch(`${ocrurl}/api/upload-image`, {
          method: 'POST', 
          headers: {
            'Content-Type': 'multipart/form-data',
            store: `${ocruploadstore}`,
          },
          body: formData,
        });
  
        // Check status first
        if (!uploadResponse.ok) {
          // If server responded with 4xx/5xx, we can read the text
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
        }
  
        // Try to parse JSON, but fallback to text if it fails
        let uploadJson;
        try {
          uploadJson = await uploadResponse.json();
        } catch (jsonError) {
          // Not valid JSON, read as text
          const text = await uploadResponse.text();
          console.log('Non-JSON response:', text);
          throw new Error(`Upload did not return valid JSON: ${text}`);
        }
  
        console.log(`Response for image index ${i}:`, uploadJson);
        const filename = uploadJson.filename;
        const imageURL = uploadJson?.message?.imageURL?.Location;
        if (filename && imageURL) {
          newFilenames.push(filename);
          newImageURLs.push(imageURL);
        } else {
          throw new Error(`Missing filename or Location in image upload ${i}`);
        }
      
      }
  
      // Update state with new filenames
      setUploadedFilenames(newFilenames);
      setUploadedImageURLs(newImageURLs);

      // 4) Call the OCR endpoint for each uploaded filename
      const tempOcrs = [];
      for (let i = 0; i < newFilenames.length; i++) {
        const fname = newFilenames[i];
console.log('fname',fname);
        const ocrResponse = await fetch(`${ocrurl}/api/ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            store: `${ocruploadstore}`,
          },
          body: JSON.stringify({
            data: {
              filename: fname,
              vendorName: selectedDatabaseName,
            },
          }),
        });

        if (!ocrResponse.ok) {
          const errorText = await ocrResponse.text();
          console.log('ocrresponse', ocrResponse);
          throw new Error(`OCR API failed (${ocrResponse.status}): ${errorText}`);
        }

        let ocrJson;
        try {
          ocrJson = await ocrResponse.json();
         
        } catch (jsonError) {
          const text = await ocrResponse.text();
          console.log('Non-JSON OCR response:', text);
          throw new Error(`OCR did not return valid JSON: ${text}`);
        }
    // Collect each OCR result in an array
        tempOcrs.push(ocrJson);
      }

      // Update state with the *complete* set of OCR results
      setOcrJsons(tempOcrs);
       console.log('tempOcrs',tempOcrs);
       console.log('ocrtdata: ',allocrJsons);
      // 5) Generate the invoice with *all* OCR data
      await generateInvoice(tempOcrs);

    } catch (error) {
      console.error('Upload or second API call failed:', error);
      Alert.alert('Error', error.message);
      setIsGenerate(false);
      setIsResponseImg(false);
    }
  };

  // ============================== GENERATE INVOICE ==============================
  const generateInvoice = async (allOcrJson) => {
    try {
   //   const combinedBodies = allOcrJson.flatMap((o) => o.body);
 const combinedBodies = allOcrJson.map((o) => o.body);
 // const flattenedData = allOcrJson.map((o) => o.body).flat();

  const flattenedData = allOcrJson.flatMap((ocrObj) => ocrObj.body);

//console.log("Formatted Combined Bodies:", JSON.stringify(flattenedData)); // Debugging
console.log("Formatted Combined Bodies:", {combinedBodies}); 
console.log('flattenedData',flattenedData.length);
console.log('combinedBodies',combinedBodies.length);
      const bodyPayload = {
        InvoiceName: selectedVendorSlug,
        ocrdata: combinedBodies,
      };

      const response = await fetch(`${ocrurl}/api/setproductintable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          store: 'premium_hillside',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorMsg}`);
      }
      const responseData = await response.json();
console.log('table data respose:',responseData);
      setTableData(responseData);
      setIsGenerate(false);
      setIsResponseImg(false);

    } catch (error) {
      setIsGenerate(false);
      setIsResponseImg(false);
      console.error('Error generating invoice:', error);
      Alert.alert('Error', error.message);
    }
  };


  // ============================== REMOVE ROW FROM TABLE (IF YOU WANT IT) ==============================
  const handleRemoveItem = (index) => {
    const updatedData = [...tableData];
    updatedData.splice(index, 1);
    setTableData(updatedData);
  };

  // ============================== CLEAR ALL STATES ==============================
  const clearAll = () => {
    setShowCamera(false);
    setSnappedImages([]);
    setOcrJsons([]);
    setTableData([]);
    setUploadedFilenames([]);
    setSelectedValue('');
    setSelectedDatabaseName('');
    setSelectedVendorSlug('');
    setIsGenerate(false);
    setIsResponseImg(false);
  };
  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };
  // ============================== RENDER UI ==============================
  return (
    <View style={styles.container}>
      {/* VENDOR SELECTION + SCAN + GENERATE BUTTON ROW */}
      <View style={styles.row}>
        <Card style={{ marginVertical: 10, backgroundColor: "#d9ecfe" }}>
          <Card.Content>
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                <View style={styles.Rowvendor}>
                  <View style={styles.dropdownContainer}>
                    <Picker selectedValue={selectedValue} onValueChange={handleValueChange}>
                      <Picker.Item label="-- Select a Vendor --" value="" />
                      {invoiceList.map((item) => (
                        <Picker.Item
                          key={item.databaseName}
                          label={item.value}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* SCAN BUTTON */}
                  <TouchableOpacity style={styles.scanButton} onPress={handleOpenCamera}>
                    <Text style={styles.buttonText}>Scan Invoice</Text>
                  </TouchableOpacity>

                  {/* GENERATE INVOICE BUTTON */}
                  {isGenerate ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.buttonText}>Generate Invoice</Text>
                    </TouchableOpacity>
                  )}
            <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
        <Text style={styles.buttonText}>Clear All</Text>
      </TouchableOpacity>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* SNAPPED IMAGES PREVIEW */}
      <ScrollView horizontal style={styles.imageRow}>
           
     {isResponseImg ? (
      snappedImages.map((item, index) => (
           <TouchableOpacity key={index} onPress={() => openModal(item.uri)}>
          <Image key={index} source={{ uri: item.uri }} style={styles.snappedImage} />
          </TouchableOpacity>
        ))
      ):
      tableData.length > 0 && uploadedFilenames.length > 0 && uploadedImageURLs.length > 0 && (
        <OCRPreviewComponent
          filenames={uploadedFilenames}
          vendorName={selectedDatabaseName}
          imageURIs={uploadedImageURLs}
          tableData={tableData}
          ocrurl={ocrurl}
        />
      )
      
        }
 <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeArea} onPress={closeModal} />
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
      </ScrollView>

      {/* TABLE OF PARSED DATA */}
      <SearchTableComponent tableData={tableData} setTableData={setTableData} />
      {tableData.length > 0 ?
       <View style={styles.Rowvendor}>
      <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
          <Text style={styles.buttonText}>Save Invoice</Text>
        </TouchableOpacity>
        <Text style={styles.BoldText}>Total Count: {tableData.length}</Text>
        <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#007bff' }]}
        onPress={() =>
          setTableData((prev) => [
            ...prev,
            {
              itemNo: '',
              description: '',
              size: '',
              qty: '',
              unitPrice: '',
              extendedPrice: '',
              pieces: '',
              barcode: '',
              condition: 'normal',
              manuallyAdded: true,
            },
          ])
        }
      >
        <Text style={styles.buttonText}>Add Manually</Text>
      </TouchableOpacity>
      </View>
        :  <Text style={styles.buttonText}></Text>
     
}
      {/* CAMERA VIEW */}
      {showCamera && (
        <View style={styles.cameraContainer}>
          <RNCamera ref={cameraRef} style={styles.cameraPreview} captureAudio={false} />
          <TouchableOpacity style={styles.snapButton} onPress={snapPhoto}>
            <Text style={styles.buttonText}>Snap Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
        
      )}
       {showSaveModal && (
        <SaveInvoiceModal
          isVisible={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          vendorName={selectedVendorSlug}
          tableData={tableData}
          cleardata ={clearAll}
        />
      )}
    </View>
  );

};

export default OcrScreen;

// ================== STYLES ==================
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff"
  },
  row: {
    marginBottom: 15,
  },
  Rowvendor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '35%',
    marginVertical: 2,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  scanButton: {
    alignSelf: 'center',
    backgroundColor: '#2C62FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 10,
  },
  saveButton: {
    alignSelf: 'center',
    backgroundColor: '#2e8b57',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    marginVertical: 10,
  },
  clearButton: {
    alignSelf: 'center',
    backgroundColor: '#D9534F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
  },
  BoldText: {
    color: '#000',
  },
  imageRow: {
    minHeight: 80,
    maxHeight: 80,
    marginVertical: 10,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 5,
  },
  snappedImage: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: "row",
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  snapButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    marginBottom: 20,
    marginRight: 5,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  horizontalScroll: {
    marginTop: 10,
  },

  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  
  tableCell: {
    flex:1,
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 5,
  },

  totalpricecol: {
    color: "#2C62FF",
  },

  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },

  infoText: {
    marginLeft: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
  col: {
    width: 150, // Set the width for each column as needed
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
