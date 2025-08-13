import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Button, TextInput, StyleSheet, useColorScheme } from "react-native";
import { BarChart, Grid, XAxis, YAxis } from "react-native-svg-charts";
import { Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import * as scale from "d3-scale";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { IconButton } from 'react-native-paper';

const screenWidth = Dimensions.get("window").width;

function ReportsByHours ({navigation}) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          color="#000"
        />
      ),
    });
  }, [navigation]);

  const colorScheme = useColorScheme();

  // Initialize state with default empty values
  const [hourlyData, setHourlyData] = useState({ labels: [], datasets: [] });
  const [chartTitle, setChartTitle] = useState("");
  const [xAxisTitle, setXAxisTitle] = useState("");
  const [yAxisTitle, setYAxisTitle] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [reportDate, setReportDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [compareSales, setCompareSales] = useState(false);
  const [compareDate, setCompareDate] = useState(new Date());
  const [showCompareDatePicker, setShowCompareDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReportDate(selectedDate);
    }
  };

  const onCompareDateChange = (event, selectedDate) => {
    setShowCompareDatePicker(false);
    if (selectedDate) {
      setCompareDate(selectedDate);
    }
  };

  const fetchData = async () => {
    let storeUrl = '';
    let accessToken = '';

    try {
      accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        setNoDataMessage("Access token not available. Please login again.");
        // console.log("Access token not available. Please login again.");
        throw new Error("Access token not available.");
      }

      storeUrl = await AsyncStorage.getItem('storeUrl');
      if (!storeUrl) {
        Alert.alert("Error", "Store URL not found in storage.");
        throw new Error("Store URL not found.");
      }

      const startDate = `${reportDate.getFullYear()}-${('0' + (reportDate.getMonth() + 1)).slice(-2)}-${('0' + reportDate.getDate()).slice(-2)} 00:00:00`;
      const endDate = `${reportDate.getFullYear()}-${('0' + (reportDate.getMonth() + 1)).slice(-2)}-${('0' + reportDate.getDate()).slice(-2)} 23:59:59`;
      const encodedStartDate = encodeURIComponent(startDate);
      const encodedEndDate = encodeURIComponent(endDate);

      const requestOptions = {
        method: 'GET',
        headers: {
          access_token: accessToken,
          Cookie: `session_id`,
        },
        redirect: 'follow',
        credentials: 'omit',
      };

      // console.log("storeUrl", storeUrl,encodedStartDate,encodedEndDate);

      const url = `${storeUrl}/api/hourly-report?start_date=${encodedStartDate}&end_date=${encodedEndDate}&option=pos_hourly_sales&company_id=1`;

      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // console.log("response hours", response);

      const result = await response.json();
      if (typeof result === 'string') {
        setNoDataMessage(result);
        setHourlyData({ labels: [], datasets: [] });
        return;
      }

      // console.log("result hours", result);
      if (result && result.data && result.data.length > 0) {
        const labels = result.data[0].x;
        const dataset1 = result.data?.[0].y.map(value => parseFloat(value));
        
        // console.log("result.datax", result.data[0].x);
        // console.log("result.data.y", result.data[0].y);
        const datasets = [
          {
            data: dataset1,
            // svg: { fill: "rgba(26, 255, 146, 0.8)" },
            svg: { fill: "rgba(0, 0, 139, 1)" },
            label: 'Primary Date'
          }
        ];

        if (compareSales) {
          const compareStartDate = `${compareDate.getFullYear()}-${('0' + (compareDate.getMonth() + 1)).slice(-2)}-${('0' + compareDate.getDate()).slice(-2)} 00:00:00`;
          const compareEndDate = `${compareDate.getFullYear()}-${('0' + (compareDate.getMonth() + 1)).slice(-2)}-${('0' + compareDate.getDate()).slice(-2)} 23:59:59`;
          const encodedCompareStartDate = encodeURIComponent(compareStartDate);
          const encodedCompareEndDate = encodeURIComponent(compareEndDate);

          const url2 = `${storeUrl}/api/hourly-report?start_date=${encodedCompareStartDate}&end_date=${encodedCompareEndDate}&option=pos_hourly_sales&company_id=1`;

          const response2 = await fetch(url2, requestOptions);
          if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
          }

          const result2 = await response2.json();
          if (typeof result2 === 'string') {
            setNoDataMessage(result2);
            setHourlyData({ labels: [], datasets: [] });
            return;
          }

          if (result2 && result2.data && result2.data.length > 0) {
            const dataset2 = result2.data[0].y.map(value => parseFloat(value));

            datasets.push({
              data: dataset2,
              svg: { fill: "rgba(255, 99, 132, 0.8)" },
              label: 'Comparison Date'
            });
          } else {
            setNoDataMessage("No Data Available To Show");
            setHourlyData({ labels: [], datasets: [] });
            return;
          }
        }

        const formattedData = {
          labels,
          datasets
        };

        setHourlyData(formattedData);
        setChartTitle(result.layout.title);
        setXAxisTitle(result.layout.xaxis.title);
        setYAxisTitle(result.layout.yaxis.title);
        setNoDataMessage("");
      } else {
        setNoDataMessage("No Data Available To Show");
        setHourlyData({ labels: [], datasets: [] });
      }
    } catch (error) {
      console.log("Error fetching data: ", error.message);
      setNoDataMessage(`Error fetching data: ${error.message}`);
      setHourlyData({ labels: [], datasets: [] });
      alert("Error fetching data. Please try again.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [reportDate, compareSales, compareDate]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      maximumZoomScale={3.0}  // Maximum zoom scale (adjust as needed)
      minimumZoomScale={1.0}  // Minimum zoom scale
      zoomScale={1.0}         // Initial zoom scale
      scrollEnabled={true}    // Ensure scrolling is enabled
      pinchGestureEnabled={true}  // Allow pinch gestures for zooming
    >
      <View>
        <Text style={styles.title}>{chartTitle}</Text>

        <View style={styles.dateContainer}>
          <TextInput
            style={styles.input1}
            placeholder="Report Date"
            value={reportDate.toLocaleDateString()}
            onFocus={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={reportDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              textColor={colorScheme === 'dark' ? 'white' : 'black'}
            />
          )}
        </View>

        <View style={styles.checkboxContainer}>
          <CheckBox
            value={compareSales}
            onValueChange={setCompareSales}
          />
          <Text style={styles.label}>Compare Sales</Text>
        </View>

        {compareSales && (
          <View style={styles.dateContainer}>
            <TextInput
              style={styles.input2}
              placeholder="Comparison Date"
              value={compareDate.toLocaleDateString()}
              onFocus={() => setShowCompareDatePicker(true)}
            />
            {showCompareDatePicker && (
              <DateTimePicker
                value={compareDate}
                mode="date"
                display="default"
                onChange={onCompareDateChange}
                textColor={colorScheme === 'dark' ? 'white' : 'black'}
              />
            )}
          </View>
        )}

        <View style={styles.btn}>
          <Button title="Get Sales" onPress={fetchData} />
        </View>

        {hourlyData.datasets.length > 0 ? (
          <ScrollView horizontal>
            <View style={{ height: 400, flexDirection: "row", paddingHorizontal: 10 }}>
              <YAxis
                style={{ paddingBottom: 40 }}
                data={hourlyData.datasets[0].data}
                contentInset={{ top: 20, bottom: 20 }}
                svg={{ fontSize: 10, fill: "black" }}
                formatLabel={(value) => `$${value}`}  // Add $ symbol before the value
              />
              <ScrollView horizontal>
                <View style={{ flex: 1, marginLeft: 10, width: screenWidth * 2 }}>
                  <BarChart
                    style={{ flex: 1 }}
                    data={hourlyData.datasets}
                    yAccessor={({ item }) => item}
                    contentInset={{ top: 40, bottom: 20 }} // Increase the top content inset
                    yMin={0}
                    gridMin={0}
                    svg={{ fill: "rgba(134, 65, 244, 0.8)" }}
                    xScale={scale.scaleBand}
                    spacingInner={0.3}
                  >
                    <Grid />
                  </BarChart>

                  {/* {hourlyData.datasets.length > 0 && (
                    <XAxis
                      style={{ marginHorizontal: -10, height: 10, marginTop: 10 }}
                      data={hourlyData.datasets[0].data}
                      formatLabel={(value, index) => `$${hourlyData.datasets[0].data[index].toFixed(2)}`} // Getting the value from the dataset
                      contentInset={{ left: 30, right: 30 }}
                      svg={{ fontSize: 6, fill: "#00FF00" }}
                    />
                  )} */}

                  {hourlyData.datasets.length > 0 && (
                    <XAxis
                      style={{ marginHorizontal: -10, height: 10, marginTop: 10 }}
                      data={hourlyData.datasets[0].data}
                      formatLabel={(value, index) => `$${hourlyData.datasets[0].data[index].toFixed(2)}`} // Getting the value from the dataset
                      contentInset={{ left: 30, right: 30 }}
                      svg={{ fontSize: 6, fill: "#00008B" }}
                    />
                  )}

                  {hourlyData.datasets.length > 1 && (
                    <XAxis
                      style={{ marginHorizontal: -10, height: 10, marginTop: 10 }}
                      data={hourlyData.datasets[1].data}
                      formatLabel={(value, index) => `$${hourlyData.datasets[1].data[index].toFixed(2)}`} // Getting the value from the dataset
                      contentInset={{ left: 30, right: 30 }}
                      svg={{ fontSize: 6, fill: "#FF69B4" }}
                    />
                  )}

                  <XAxis
                    style={{ marginHorizontal: -10, height: 15 }}
                    data={hourlyData.labels}
                    formatLabel={(value, index) => hourlyData.labels[index]}
                    contentInset={{ left: 30, right: 30 }}
                    svg={{ fontSize: 10, fill: "black" }}
                  />

                </View>

              </ScrollView>
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noData}>{noDataMessage}</Text>
        )}


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#f58b40',
    fontSize: 21,
    fontWeight: 'bold',
    margin: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  input1: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: '#00008B',
  },
  input2: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: '#FF69B4',
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 5,
    color: '#00008B',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 50,
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
  },
  noData: {
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
});

export default ReportsByHours;
