import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
  } from 'react-native';
  import React, {useState} from 'react';
  import Dropdown from './Dropdown';
  
  const SalesByDepartment = ({navigation}) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
  

  
    let data = [
      {id: 1, name: 'All'},
      {id: 2, name: 'Today'},
      {id: 3, name: 'Yesterday'},
      {id: 4, name: 'Current Week'},
      {id: 5, name: 'Previous Week'},
      {id: 6, name: 'Current Month'},
      {id: 7, name: 'Previous Month'},
      {id: 8, name: 'Current Quarter'},
      {id: 9, name: 'Previous Quarter'},
      {id: 10, name: 'Current Year'},
      {id: 11, name: 'Previous Year'},
      {id: 12, name: 'Current Fiscal Year'},
      {id: 13, name: 'Previous Fiscal Year'},
      {id: 14, name: 'Custom'},
    ];
    let Lable = 'Select Period:';
  
    const onSelect = item => {
      setSelectedItem(item);
      let timePeriod = item.name;
      if (timePeriod === 'All') {
        setStartDate('🔥');
        setEndDate('🔥');
        alert('... to be added !');
      }
      if (timePeriod === 'Today') {
        var start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date();
        end.setUTCHours(23, 59, 59, 999);
        setStartDate(start.toISOString());
        setEndDate(end.toISOString());
      }
      if (timePeriod === 'Yesterday') {
        let OneDay = 24 * 60 * 60 * 1000;
        setEndDate(new Date(Date.now()).toISOString());
        setStartDate(new Date(Date.now() - OneDay).toISOString());
      }
      if (timePeriod === 'Current Week') {
        var curr = new Date();
        var firstday = new Date(
          curr.setDate(curr.getDate() - curr.getDay()),
        ).toISOString();
        var lastday = new Date(
          curr.setDate(curr.getDate() - curr.getDay() + 6),
        ).toISOString();
        setStartDate(firstday);
        setEndDate(lastday);
      }
      if (timePeriod === 'Previous Week') {
        var curr = new Date();
        var firstday = new Date(
          curr.setDate(curr.getDate() - curr.getDay()),
        ).toISOString();
        var lastday = new Date(
          curr.setDate(curr.getDate() - curr.getDay() - 6),
        ).toISOString();
        setStartDate(firstday);
        setEndDate(lastday);
      }
      if (timePeriod === 'Current Month') {
        var date = new Date(),
          y = date.getFullYear(),
          m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        setStartDate(firstDay.toISOString());
        setEndDate(lastDay.toISOString());
      }
      if (timePeriod === 'Previous Month') {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const firstDay = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth(),
          1,
        );
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(firstDay.toISOString());
        setEndDate(lastDay.toISOString());
      }
      if (timePeriod === 'Current Quarter') {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(
          quarterStart.getFullYear(),
          quarterStart.getMonth() + 3,
          0,
        );
        setStartDate(quarterStart.toISOString());
        setEndDate(quarterEnd.toISOString());
      }
      if (timePeriod === 'Previous Quarter') {
        const today = new Date();
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStartDate = new Date(
          today.getFullYear(),
          quarter * 3 - 3,
          1,
        );
        const quarterEndDate = new Date(
          quarterStartDate.getFullYear(),
          quarterStartDate.getMonth() + 3,
          0,
        );
        const previousQuarterStartDate = new Date(
          quarterStartDate.getFullYear(),
          quarterEndDate.getMonth() - 3,
          1,
        );
        const previousQuarterEndDate = new Date(
          previousQuarterStartDate.getFullYear(),
          previousQuarterStartDate.getMonth() + 3,
          0,
        );
        setStartDate(previousQuarterStartDate.toISOString());
        setEndDate(previousQuarterEndDate.toISOString());
      }
      if (timePeriod === 'Current Year') {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const firstDay = new Date(currentYear, 0, 1);
        const lastDay = new Date(currentYear, 11, 31);
        setStartDate(firstDay.toISOString());
        setEndDate(lastDay.toISOString());
      }
      if (timePeriod === 'Previous Year') {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const previousYear = currentYear - 1;
        const firstDay = new Date(previousYear, 0, 1);
        const lastDay = new Date(previousYear, 11, 31);
        setStartDate(firstDay.toISOString());
        setEndDate(lastDay.toISOString());
      }
      if (timePeriod === 'Current Fiscal Year') {
        const today = new Date();
        const currentYear = today.getFullYear();
        const fiscalYearStart = new Date(currentYear, 3, 1);
        const fiscalYearEnd = new Date(currentYear + 1, 2, 31);
        if (today < fiscalYearStart) {
          fiscalYearStart.setFullYear(currentYear - 1);
          fiscalYearEnd.setFullYear(currentYear);
        }
        setStartDate(fiscalYearStart.toISOString());
        setEndDate(fiscalYearEnd.toISOString());
      }
      if (timePeriod === 'Previous Fiscal Year') {
        let today = new Date();
        let fiscalYearEnd = new Date(today.getFullYear(), 2, 31);
        let fiscalYearStart = new Date(fiscalYearEnd.getFullYear() - 1, 3, 1);
        setStartDate(fiscalYearStart.toISOString());
        setEndDate(fiscalYearEnd.toISOString());
      }
      if (timePeriod === 'Custom') {
        alert('Custom date');
      }
    };
  
    return (
      <View>
        <Dropdown
          data={data}
          onSelect={onSelect}
          value={selectedItem}
          Lable={Lable}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <TextInput style={styles.datebox}>{startDate?.split('T')[0]}</TextInput>
          <TextInput style={styles.datebox}>{endDate?.split('T')[0]}</TextInput>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SalesByDepartmentReport')
            // console.log(startDate,'\n',endDate)
          }}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#02a390',
            marginHorizontal: '4%',
            marginTop: '4%',
            padding: '3.5%',
            alignItems: 'center',
            borderRadius: 8,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 20, color: '#fff'}}>View Report</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  export default SalesByDepartment;
  
  const styles = StyleSheet.create({
    datebox: {
      padding: '2%',
      width: '40%',
      height: 40,
      borderColor: '#000',
      borderWidth: 1,
      color: '#000',
      fontSize: 20,
    },
    InputDate: {
      borderBottomColor: '#000',
      borderBottomWidth: 1,
      padding: '2%',
      width: '85%',
      marginTop: '8%',
      fontSize: 20,
    },
  });
  