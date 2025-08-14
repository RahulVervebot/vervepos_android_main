import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';
import { fetchManageOrderReport } from '../../functions/DepartmentAccess/function_dep';

const DownloadOrderReportExcel = ({ startDate, endDate }) => {
  
  const [filePath, setFilePath] = useState(null);

  const generateExcelReport = async () => {
    
    try {
      const data = await new Promise((resolve, reject) => {
        fetchManageOrderReport(startDate, endDate, resolve, reject);
      });

      if (!Array.isArray(data) || data.length === 0) {
        Alert.alert('No Data', 'No order report data found.');
        return;
      }

      const groupedByDate = data.reduce((acc, item) => {
        const dateKey = item.invoiceUpdateDate.split(' ')[0];
        const invoiceKey = item.invoiceNumber;
        const vendorName = item.vendorName;
        const dept = item.departmentName;

        if (!acc[dateKey]) acc[dateKey] = {};
        if (!acc[dateKey][invoiceKey]) acc[dateKey][invoiceKey] = {};
        if (!acc[dateKey][invoiceKey][vendorName]) acc[dateKey][invoiceKey][vendorName] = {};
        if (!acc[dateKey][invoiceKey][vendorName][dept]) acc[dateKey][invoiceKey][vendorName][dept] = [];

        acc[dateKey][invoiceKey][vendorName][dept].push(item);
        return acc;
      }, {});

      const worksheetData = [];

      Object.entries(groupedByDate).forEach(([date, invoices]) => {
        worksheetData.push([`Date: ${date}`]);
      
        Object.entries(invoices).forEach(([invoiceNumber, vendors]) => {
          worksheetData.push([`PO: ${invoiceNumber}`]);
          worksheetData.push(['Vendor', 'Department', 'Amount', '', 'Department Name', 'Department Total']);
      
          const deptTotals = {}; // accumulate totals for department per invoice
          const rows = [];
      
          Object.entries(vendors).forEach(([vendorName, departments]) => {
            Object.entries(departments).forEach(([department, items]) => {
              const total = items.reduce((sum, i) => {
                if(i.invQty > 0){
                const cost = parseFloat(i.invCaseCost || 0);
                const qty = parseFloat(i.invQty || 0);
                return sum + cost * qty;
                }
                else{
                    const cost = parseFloat(i.posUnitCost || 0);
                    const qty = parseFloat(i.unitQty || 0);
                    return sum + cost * qty;
                }
              }, 0);
      
              rows.push([vendorName, department, total.toFixed(2)]);
      
              if (!deptTotals[department]) {
                deptTotals[department] = 0;
              }
              deptTotals[department] += total;
            });
          });
      
          // append all rows to worksheet
          rows.forEach((row, index) => {
            const deptName = Object.keys(deptTotals)[index] || '';
            const deptTotal = deptName ? deptTotals[deptName].toFixed(2) : '';
            worksheetData.push([...row, '', deptName, deptTotal]);
          });
      
          const totalForInvoice = rows.reduce((sum, row) => sum + parseFloat(row[2]), 0);
          worksheetData.push(['', '', '', '', 'TOTAL', totalForInvoice.toFixed(2)]);
          worksheetData.push([]); // space between POs
        });
      
        worksheetData.push([]); // space between dates
      });
      

      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const path = `${RNFS.DownloadDirectoryPath}/Consolidated_Report_${Date.now()}.xlsx`;

      await RNFS.writeFile(path, wbout, 'ascii');
      setFilePath(path);
      Alert.alert('Success', `Excel saved to ${path}`);
    } catch (error) {
      console.error('Excel generation error:', error);
      Alert.alert('Error', 'Failed to generate Excel report');
    }
  };

  const handleOpen = async () => {
    if (!filePath) {
      Alert.alert('No File', 'Generate the Excel file first.');
      return;
    }

    try {
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Unable to open the file.');
    }
  };

  const handleShare = async () => {
    if (!filePath) {
      Alert.alert('No File', 'Generate the Excel file first.');
      return;
    }

    try {
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Share Excel Report',
      });
    } catch (error) {
      console.error('Share error:', error);
    //   Alert.alert('Error', 'Unable to share the file.');
    }
  };

  return (
    <View style={{ padding: 10,flexDirection:"row", justifyContent:'space-between'}}>
      <TouchableOpacity
        onPress={generateExcelReport}
        style={{
          backgroundColor: '#2C62FF',
          padding: 12,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Download Consolidated Report</Text>
      </TouchableOpacity>
{/* {filePath ?
      <TouchableOpacity
        onPress={handleOpen}
        style={{
          backgroundColor: '#27ae60',
          padding: 12,
          borderRadius: 5,
          marginBottom: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Open Excel</Text>
 </TouchableOpacity>
:null} */}
      <TouchableOpacity
        onPress={handleShare}
        style={{
          backgroundColor: '#f39c12',
          padding: 12,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Share Consolidated Report</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DownloadOrderReportExcel;
