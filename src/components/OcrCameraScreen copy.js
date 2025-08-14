import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Text, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import SearchTableComponent from './SearchORCTable';
import SaveInvoiceModal from './SaveInvoiceModal';
const OcrScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const baseurl = "https://icmsfrontend.vervebot.io";
  const [invoiceList, setInvoiceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerate, setIsGenerate] = useState(false);
  // Dropdown-related
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedDatabaseName, setSelectedDatabaseName] = useState('');
  const [selectedVendorSlug, setSelectedVendorSlug] = useState('');
  // Holds an array of { uri, base64 } for each snapped photo
  const [snappedImages, setSnappedImages] = useState([]);
  // Holds all OCR JSON results before generating the invoice
  const [allocrJsons, setOcrJsons] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false); // State for modal visibility

  // Holds the filenames returned by the server from the upload
  const [uploadedFilenames, setUploadedFilenames] = useState([]);

  // Table data after invoice generation
  const [tableData, setTableData] = useState([]);

  // Camera visibility
  const [showCamera, setShowCamera] = useState(false);

  // ============================== USE EFFECT ==============================
  useEffect(() => {
    // Fetch data from your endpoint
    fetch(`${baseurl}/api/getinvoicelist`)
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
        const uploadResponse = await fetch(`${baseurl}/api/upload-image`, {
          method: 'POST', 
          headers: {
            'Content-Type': 'multipart/form-data',
            store: 'premium_hillside',
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
  
        if (uploadJson && uploadJson.filename) {
          newFilenames.push(uploadJson.filename);
        } else {
          // If your server is supposed to always return a filename,
          // handle the case where it's missing
          throw new Error(`No filename in response for image ${i}`);
        }
      }
  
      // Update state with new filenames
      setUploadedFilenames(newFilenames);
  

      // 4) Call the OCR endpoint for each uploaded filename
      const tempOcrs = [];
      for (let i = 0; i < newFilenames.length; i++) {
        const fname = newFilenames[i];
console.log('fname',fname);
        const ocrResponse = await fetch(`${baseurl}/api/ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            store: 'premium_hillside',
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

      const response = await fetch(`${baseurl}/api/setproductintable`, {
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

    } catch (error) {
      setIsGenerate(false);
      console.error('Error generating invoice:', error);
      Alert.alert('Error', error.message);
    }
  };

//   const generateInvoice = async (allOcrJson) => {
//     try {
//         // Flatten the array of OCR results to make sure all body data is included
//         const combinedBodies = allOcrJson.reduce((acc, o) => [...acc, ...o.body], []);

//         console.log('Combined Bodies:', combinedBodies);

//         const bodyPayload = {
//             InvoiceName: selectedVendorSlug,
//             ocrdata: combinedBodies,
//         };

//         const response = await fetch(`${baseurl}/api/setproductintable`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 store: 'premium_hillside',
//             },
//             body: JSON.stringify(bodyPayload),
//         });

//         if (!response.ok) {
//             const errorMsg = await response.text();
//             throw new Error(`Request failed: ${response.status} - ${errorMsg}`);
//         }

//         const responseData = await response.json();
//         setTableData(responseData);
//         setIsGenerate(false);

//     } catch (error) {
//         setIsGenerate(false);
//         console.error('Error generating invoice:', error);
//         Alert.alert('Error', error.message);
//     }
// };

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
        {snappedImages.map((item, index) => (
          <Image key={index} source={{ uri: item.uri }} style={styles.snappedImage} />
        ))}


      </ScrollView>

      {/* TABLE OF PARSED DATA */}
      <SearchTableComponent tableData={tableData} />
      {tableData.length > 0 ?
      <TouchableOpacity style={styles.clearButton} onPress={() => setShowSaveModal(true)}>
          <Text style={styles.buttonText}>Save Invoice</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  snapButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    marginBottom: 40,
    borderRadius: 5,
  },
  horizontalScroll: {
    marginTop: 10,
  },
  // poTableContainer: {
  //   maxHeight: 400, // Adjust if you want to limit vertical height
  // },
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
});
