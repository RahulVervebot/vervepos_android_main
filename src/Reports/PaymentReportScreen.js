import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  List,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { omit } from 'lodash';

const screenWidth = Dimensions.get('window').width;

const PaymentReportScreen = ({ route, navigation }) => {
  const [paymentData, setPaymentData] = useState({});
  const [tenderData, setTenderData] = useState([]);
  const [cashData, setCashData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [index, setIndex] = useState(10);
  const [taxData, setTaxData] = useState([]);
  const [showTaxData, setShowTaxData] = useState(true);
  const [paymentSummaryData, setPaymentSummaryData] = useState([]);
  const [showPaymentSummary, setShowPaymentSummary] = useState(true);
  const [paymentDis,setPaymentDis] = useState(true)

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      try {
        let current_url = await AsyncStorage.getItem('storeUrl');
        let current_access_token = await AsyncStorage.getItem('access_token');
        console.log("route.params.startDate:",route.params.startDate);
        var myHeaders = new Headers();
        // myHeaders.append('Cookie', 'session_id');
        myHeaders.append('access_token', current_access_token);
    
        const requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow',
          credentials: 'omit',
        };
        // console.log("requestOptions",requestOptions);
    
        const isEmptyResponse = (result) => {
          return !result || 
            Object.keys(result).length === 0 ||
            (result._U === 0 && result._V === 0 && result._W === null && result._X === null) ||
            (Array.isArray(result) && result.length < 1);
        };
    
        const fetchWithJson = async (url) => {
          const response = await fetch(url, requestOptions);
          if(!response.ok){
            setPaymentDis(false)
            return []
          }
          const data = await response.json();
          // console.log("response data=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",url,data);
          return data;
        };
    
        const [paymentResult, tenderResult, cashResult, departmentResult, returnResult] =
          await Promise.all([
            fetchWithJson(`${current_url}/api/payment_type_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`),
            fetchWithJson(`${current_url}/api/tender_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`),
            fetchWithJson(`${current_url}/api/pos_payment_summary_detail_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`),
            fetchWithJson(`${current_url}/api/deparment_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`),
            fetchWithJson(`${current_url}/api/refund_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`),
          ]);
    
        // console.log("Data Fetch resoleve ",signal,paymentResult, tenderResult, cashResult, departmentResult, returnResult)
        if (signal.aborted) return;
    
        // Check all responses at once
        if ([paymentResult, tenderResult, cashResult, departmentResult, returnResult]
            .some(result => isEmptyResponse(result))) {
          alert('No data found. Try selecting a different time frame.');
          setPaymentDis(false)
          return;
        }
    
        // Update states if data exists
        console.log("API 2 Results:", { paymentResult, tenderResult, cashResult, departmentResult, returnResult });
        console.log('tenderResult:',tenderResult.total_cards.length);
        setIndex(tenderResult.total_cards.length);
        setPaymentData(paymentResult);
        setTenderData(tenderResult);
        setCashData(cashResult?.payment_method_summaries);
        setDepartmentData(departmentResult);
        setReturnData([returnResult]);
    
      } catch (error) {
        if (signal.aborted) return;
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again.');
        setPaymentDis(false)
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [route.params.startDate, route.params.endDate]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchTaxAndPaymentSummaryData = async () => {
      try {
        let current_url = await AsyncStorage.getItem('storeUrl');
        let current_access_token = await AsyncStorage.getItem('access_token');

        var myHeaders = new Headers();
        myHeaders.append('access_token', current_access_token);
        // myHeaders.append('Cookie', 'session_id');

        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          signal,
          redirect: 'follow',
          credentials: 'omit',
        };

        // console.log(
        //   'showTaxData====================================>showTaxData',
        // );

        const fetchTaxData = fetch(
          `${current_url}/api/payment_taxes_detail_report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`,
          requestOptions
        ).then((response) => response.json())
        .then((result) => {
          // console.log("postman result 4",result)
          return result})
        .catch((error) => console.error(error));

        const [taxResult] = await Promise.all([
          fetchTaxData,
        ]);

        if (signal.aborted) return;
        
        // console.log('fetchPaymentSummaryData    =>>>>>>>>>>>>>>>>>>>>>',taxResult);


        if (taxResult.error) {
          setShowTaxData(false);
        } else {
          setTaxData(taxResult.result);
        }

      } catch (error) {
        if (signal.aborted) return;
        console.error('Error fetching data:', error);
        setShowTaxData(false);
        setShowPaymentSummary(false);
      }
    };

    // console.log('fetchCashData======================================calllfetchTaxAndPaymentSummaryData')
    fetchTaxAndPaymentSummaryData();

    return () => {
      controller.abort();
    };
  }, [route.params.startDate, route.params.endDate]);


  const onLoadMore = () => {
    setIndex(index + 10);
  };

  const getColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const paymentChartData = paymentData.payment_type
    ? paymentData.payment_type.map((item) => ({
      name: item.name,
      amount: item.total_amount,
      color: getColor(),
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }))
    : [];

  // console.log("showPaymentSummary", showPaymentSummary);
  // console.log("showTaxData", taxData);

  // Calculating SUM OF CASH IN Amount.
  let totalcashinamount = 0;
  {
    cashData.length === 0 ? (
      totalcashinamount = 0
    ) : (
      cashData.filter(data => data.name === "Cash").map((data, idx) => (
        totalcashinamount = data.total_cash_in ? data.total_cash_in.reduce((sum, cashIn) => sum + (cashIn.cash_in || 0), 0) : 0
      ))
    )
  }
  // console.log("totalcashinamount", totalcashinamount);

  // Calculating SUM OF CASH OUT Amount.
  let totalcashoutamount = 0;
  {
    cashData.length === 0 ? (
      totalcashoutamount = 0
    ) : (
      cashData.filter(data => data.name === "Cash").map((data, idx) => (
        totalcashoutamount = data.total_cash_out ? data.total_cash_out.reduce((sum, cashOut) => sum + (cashOut.cash_out || 0), 0) : 0
      ))
    )
  }
  // console.log("totalcashoutamount", totalcashoutamount);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Sales Summary Report</Title>
          <Paragraph>
            {route.params.startDate}
          </Paragraph>
           <Paragraph>
          to
          </Paragraph>
             <Paragraph>
            {route.params.endDate}
          </Paragraph>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.chartTitle}>Payment Methods Distribution</Text>
        {paymentData.payment_type ? (
          <PieChart
            data={paymentChartData}
            width={screenWidth - 50}
            height={160}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 0,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            accessor="amount"
            backgroundColor="transparent"
            center={[0, 0]}
            absolute
          />
        ) : paymentDis ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <Text style={styles.noDataText}>No Data</Text>
        )}
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Title>POS Payment Collection</Title>
          {paymentData?.payment_type?.length == 0 ? (
            <Text style={styles.noDataText}>No Data for this time frame.</Text>
          ) : (
            paymentData?.payment_type?.slice(0, index)?.map((data, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.boxtext}>
                  {data.name} ({data.count})
                </Text>
                <Text style={styles.boxtext}>
                  $ {Intl.NumberFormat('en-US').format(data.total_amount)}
                </Text>
              </View>
            ))
          )}
          {paymentData ? (
            <View>
              <Divider />
              <View style={styles.row}>
                <Text style={styles.totalText}>
                  Total (
                  {paymentData?.payment_type?.reduce(
                    (n, {count}) => n + count,
                    0,
                  )}
                  )
                </Text>
                <Text style={styles.totalText}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                    paymentData?.payment_type?.reduce(
                      (n, {total_amount}) => n + total_amount,
                      0,
                    ),
                  )}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalText}>Avg. order value</Text>
                <Text style={styles.totalText}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                    paymentData?.payment_type?.reduce(
                      (n, {total_amount}) => n + total_amount,
                      0,
                    ) /
                      paymentData?.payment_type?.reduce(
                        (n, {count}) => n + count,
                        0,
                      ),
                  )}
                </Text>
              </View>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Cash In & Out Details</Title>
          {cashData.length === 0 ? (
            <Text style={styles.noDataText}>NO Data FOR THIS TIME FRAME.</Text>
          ) : (
            // cashData.filter(data => data.payment_method_id === 1).map((data, idx) => (
            cashData
              .filter(data => data.name === 'Cash')
              .map((data, idx) => (
                <View key={idx} style={styles.section}>
                  <Text style={styles.headerText}>Cash In Details</Text>
                  {data.total_cash_in && data.total_cash_in.length > 0 ? (
                    <ScrollView horizontal>
                      <View>
                        <View style={styles.tableHeader}>
                          <Text style={styles.tableHeaderText}>CASHIER</Text>
                          <Text style={styles.tableHeaderText}>AMOUNT</Text>
                          <Text style={styles.tableHeaderText}>REASON</Text>
                          <Text style={styles.tableHeaderText}>DATE</Text>
                        </View>
                        {data.total_cash_in.map((cashIn, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCell}>
                              {cashIn.res_name || 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              $
                              {cashIn.cash_in != null
                                ? Intl.NumberFormat('en-US').format(
                                    cashIn.cash_in,
                                  )
                                : 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              {cashIn.payment_ref || 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              {cashIn.create_date || 'N/A'}
                            </Text>
                          </View>
                        ))}

                        <Text style={styles.tableHeader}>
                          TOTAL CASH IN: $
                          {Intl.NumberFormat('en-US').format(totalcashinamount)}
                        </Text>
                      </View>
                    </ScrollView>
                  ) : (
                    <Text style={styles.noDataText}>NO CASH IN</Text>
                  )}
                  <Text style={styles.headerText}>Cash Out Details</Text>
                  {data.total_cash_out && data.total_cash_out.length > 0 ? (
                    <ScrollView horizontal>
                      <View>
                        <View style={styles.tableHeader}>
                          <Text style={styles.tableHeaderText}>CASHIER</Text>
                          <Text style={styles.tableHeaderText}>AMOUNT</Text>
                          <Text style={styles.tableHeaderText}>REASON</Text>
                          <Text style={styles.tableHeaderText}>DATE</Text>
                        </View>
                        {data.total_cash_out.map((cashOut, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCell}>
                              {cashOut.res_name || 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              $
                              {cashOut.cash_out != null
                                ? Intl.NumberFormat('en-US').format(
                                    cashOut.cash_out,
                                  )
                                : 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              {cashOut.payment_ref || 'N/A'}
                            </Text>
                            <Text style={styles.tableCell}>
                              {cashOut.create_date || 'N/A'}
                            </Text>
                          </View>
                        ))}
                        <Text style={styles.tableHeader}>
                          TOTAL CASH OUT: $
                          {Intl.NumberFormat('en-US').format(
                            totalcashoutamount,
                          )}
                        </Text>
                      </View>
                    </ScrollView>
                  ) : (
                    <Text style={styles.noDataText}>NO CASH OUT</Text>
                  )}
                  <View>
                    <Text style={styles.headerText}>
                      FINAL CASH: $
                      {data.amount != null
                        ? Intl.NumberFormat('en-US').format((data.amount+(data.total_cash_in?.map(cash=>cash.cash_in).reduce((a,b)=>a+b,0))+(data.total_cash_out?.map(cash=>cash.cash_out).reduce((a,b)=>a+b,0))))
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Card Tender Details</Title>
          {tenderData?.total_cards?.length == 0 ? (
            <Text style={styles.noDataText}>No Data for this time frame.</Text>
          ) : (
            tenderData?.total_cards?.slice(0, index)?.map((data, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.boxtext}>
                  {data.card_type == null ? 'MR' : data.card_type} ({data.count}
                  )
                </Text>
                <Text style={styles.boxtext}>
                  $ {Intl.NumberFormat('en-US').format(data.total_amount)}
                </Text>
              </View>
            ))
          )}
          {tenderData?.total_cards ? (
            <View>
              <Divider />
              <View style={styles.row}>
                <Text style={styles.totalText}>
                  Total (
                  {tenderData?.total_cards?.reduce(
                    (n, {count}) => n + count,
                    0,
                  )}
                  )
                </Text>
                <Text style={styles.totalText}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                    tenderData?.total_cards?.reduce(
                      (n, {total_amount}) => n + total_amount,
                      0,
                    ),
                  )}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalText}>Avg. order value</Text>
                <Text style={styles.totalText}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                    tenderData?.total_cards?.reduce(
                      (n, {total_amount}) => n + total_amount,
                      0,
                    ) /
                      tenderData?.total_cards?.reduce(
                        (n, {count}) => n + count,
                        0,
                      ),
                  )}
                </Text>
              </View>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      {/* {console.log("showTaxData ===============>",showTaxData,taxData)} */}
      {showTaxData && taxData && taxData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{alignItems:'center',textAlign:'center',fontSize:18,fontWeight:'bold'}}>Tax Collection Details</Title>
            <View style={[styles.row]}>
              <Text style={styles.headerTextTax}>Tax Value</Text>
              <Text style={styles.headerTextTax}>Tax Collected</Text>
              <Text style={styles.headerTextTax}>Sales Amount</Text>
            </View>
            {taxData?.length == 0 ? (
              <Text style={styles.noDataText}>
                No Data for this time frame.
              </Text>
            ) : (
              taxData?.map((data, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.boxtext}>{data?.name}</Text>
                  <Text style={styles.boxtext}>
                    ${' '}
                    {Intl.NumberFormat('en-US').format(
                      Math.round(data?.tax_amount),
                    )}
                  </Text>
                  <Text style={styles.boxtext}>
                    ${' '}
                    {Intl.NumberFormat('en-US').format(
                      Math.round(data?.base_amount),
                    )}
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Return Report</Title>
          {returnData?.length == 0 ? (
            <Text style={styles.noDataText}>No Data for this time frame.</Text>
          ) : (
            returnData?.map((data, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.boxtext}>Total Refunds </Text>
                <Text style={styles.boxtext}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                    Math.round(data.total_refunds),
                  )}
                </Text>
                <Text style={styles.boxtext}>Refund Count </Text>
                <Text style={styles.boxtext}>{data.total_refunds_count}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Department Wise Sales</Title>
          <View style={styles.row}>
            <Text style={styles.headerText}>Name</Text>
            <Text style={styles.headerText}>Quantity</Text>
            <Text style={styles.headerText}>Sales Amount</Text>
          </View>
          {departmentData?.payment_type?.length == 0 ? (
            <Text style={styles.noDataText}>No Data for this time frame.</Text>
          ) : (
            departmentData?.payment_type?.map((data, idx) => (
              <View key={idx} style={styles.rowdepartment}>
                <Text style={styles.nameCell}>{data?.name}</Text>
                <Text style={styles.qtyCell}>
                  {Math.round((data?.qty + Number.EPSILON) * 100) / 100}
                </Text>
                <Text style={styles.amountCell}>
                  ${' '}
                  {Intl.NumberFormat('en-US').format(
                      Math.round((data?.sale_amount + Number.EPSILON) * 100) / 100
                    // Math.round(data?.sale_amount),
                  )}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

    </ScrollView>
  );
};

export default PaymentReportScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: '1%',
    height: '95%',
  },
  card: {
    marginHorizontal: '5%',
    marginVertical: '2%',
    borderRadius: 20,
  },
  section: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  taxDeatils: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  boxtext: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: '10%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingVertical: 8,
  },
  headerTextTax: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    paddingVertical: 8,
  },
  noDataText: {
    alignSelf: 'center',
    fontSize: 18,
    color: '#b0b0b0',
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: screenWidth / 4, // Divide equally for 4 columns
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 16,
    width: screenWidth / 4, // Divide equally for 4 columns
    textAlign: 'center',
  },
  table: {
    width: screenWidth, // Make the table take the full screen width
  },
  chartTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  // Departmennt CSS 
  rowdepartment: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  nameCell:  { 
    flexGrow:1, flexShrink:1, marginRight:8, fontSize:16 
  },
  qtyCell:   { 
    width:70, textAlign:'right', fontSize:16 
  },
  amountCell:{ 
    width:110, textAlign:'right', fontSize:16, marginLeft:8 
  },
});

