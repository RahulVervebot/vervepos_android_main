import React, { useEffect, useState } from 'react';
import { View, Dimensions, ActivityIndicator, ScrollView, Text } from 'react-native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import Svg, { Text as SVGText, TSpan } from 'react-native-svg';
import { TopVendorData } from '../functions/DepartmentAccess/function_dep';
const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH_PERCENT = 0.9;

const TopVendorBarChart = () => {
  const [barData, setBarData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [maxValue, setMaxValue] = useState(100);
  const [loading, setLoading] = useState(true);
  const CustomXAxisLabels = ({ labels, chartWidth, barCount }) => {
    const barWidth = chartWidth / barCount;
  
    return (
      <Svg width={chartWidth} height={60}>
        {labels.map((label, index) => {
          const x = barWidth * index + barWidth / 2;
  
          return (
            <SVGText
              key={index}
              x={x}
              y={10}
              fontSize={10}
              fill="#000"
              rotation={-40}
              origin={`${x},10`}
              textAnchor="end"
            >
              <TSpan>{label}</TSpan>
            </SVGText>
          );
        })}
      </Svg>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await TopVendorData();
      if (response && response.status === 'success') {
        const vendors = response.data.slice(0, 5); // Top 5 vendors
        const chartData = [];
        const labelList = [];
        let allValues = [];
        vendors.forEach((v) => {
          chartData.push({ value: v.currentWeekOrderCount, svg: { fill: '#FFD557' } });
          labelList.push(`${v.vendorName}`);
          chartData.push({ value: v.lastWeekOrderCount, svg: { fill: '#54AFDF' } });
          labelList.push(`${v.vendorName}`);
          allValues.push(v.lastWeekOrderCount, v.currentWeekOrderCount);
        });

        const max = Math.max(...allValues);
        const yMax = Math.ceil(max * 1.2);

        setMaxValue(yMax);
        setBarData(chartData);
        setLabels(labelList);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Labels = ({ x, y, bandwidth, data }) => (
    data.map((value, index) => (
      <SVGText
        key={index}
        x={x(index) + bandwidth/2}
        y={y(value.value) - 10}
        fontSize={10}
        fill="#000"
        alignmentBaseline="middle"
        textAnchor="middle"
      >
        {value.value}
      </SVGText>
    ))
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const chartMaxWidth = screenWidth * CHART_WIDTH_PERCENT;
  const requiredChartWidth = screenWidth * CHART_WIDTH_PERCENT;
  const isScrollRequired = requiredChartWidth > chartMaxWidth;
  const actualChartWidth = screenWidth * CHART_WIDTH_PERCENT;
  const totalBars = barData.length;
  const dynamicBarWidth = (screenWidth * CHART_WIDTH_PERCENT) / 10;

  return (
    <View style={{ padding: 20 }}>
      {/* Header Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <TSpan style={{ fontSize: 18, fontWeight: 'bold' }}>Top 5 Vendors</TSpan>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
            <View style={{ width: 12, height: 12, backgroundColor: '#54AFDF', marginRight: 5, borderRadius: 2 }} />
            <TSpan style={{ fontSize: 12 }}>Last Week</TSpan>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, backgroundColor: '#FFD557', marginRight: 5, borderRadius: 2 }} />
            <TSpan style={{ fontSize: 12 }}>Current Week</TSpan>
          </View>
        </View>
      </View>

      {/* Chart Container with Border */}
      <View style={{
  flexDirection: 'row',
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  backgroundColor: '#fff',
  overflow: 'hidden'
}}>
  <YAxis
    data={[0, maxValue]}
    contentInset={{ top: 30, bottom: 20 }}
    svg={{ fontSize: 10, fill: '#333' }}
    numberOfTicks={6}
  />
  <View style={{ flex: 1, paddingLeft: 5 }}>
  <BarChart
  style={{ height: 300, width: screenWidth * CHART_WIDTH_PERCENT }}
  data={barData}
  yAccessor={({ item }) => item.value}
  yMax={maxValue}
  spacingInner={0.8}
  contentInset={{bottom: 20 }}
>
  <Grid />
  <Labels />
</BarChart>

<CustomXAxisLabels
  labels={labels}
  chartWidth={screenWidth * CHART_WIDTH_PERCENT}
  barCount={barData.length}
  chartHeight={300}
/>
    
  </View>
</View>
    </View>
  );

};

export default TopVendorBarChart;
