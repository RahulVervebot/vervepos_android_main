import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import Home from './screen/Home';
import Reports from './screen/Reports';
import InvoiceReports from './screen/InvoiceReports';
import IcmsProductStallReport from './Reports/IcmsProductStallReport';
import InvoiceDataReport from './Reports/InvoiceDataReport';
import IcmsInvenotryReport from './Reports/IcmsInventoryReport';
import SalesSummaryReport from './screen/SalesSummaryReport';
import SalesSummary from './Reports/SalesSummary';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from './screen/Login';
import CustomDrawer from './components/CustomDrawer';
import SalesByDepartment from './screen/SalesByDepartment';
import PaymentReport from './Reports/PaymentReport';
import PaymentReportScreen from './Reports/PaymentReportScreen';
import SessionList from './Reports/SessionList';
import Zreport from './Reports/Zreport';
import SalesByDepartmentReport from './Reports/SalesByDepartmentReport';
import ItemMovementReport from './screen/ItemMovementReport';
import ItemMovement from './Reports/ItemMovement';
import EmployeeActivity from './screen/EmployeeActivity';
import EmployeeActivityReport from './Reports/EmployeeActivityReport';
import TaxCollection from './screen/TaxCollection';
import TaxCollectionReport from './Reports/TaxCollectionReport';
import Barcode from './components/Barcode';
import WebViewScreen from './components/WebViewScreen';  // Your newly created WebView screen
import BarcodeScannerWithProps from './components/BarcodeScannerWithProps';
import ProductInformation from './screen/ProductInformation';
import TopSellingProducts from './screen/TopSellingProducts';
import TopSellingCategories from './screen/TopSellingCategories';

import CreditSaleReport from './screen/CreditSaleReport';

import SalesReport from './screen/SalesReport';
import SalesReportClicked from './screen/SalesReportClicked';
import PromotionList from './screen/PromotionList';
import Product from './screen/Product';
import AddProduct from './screen/AddProduct';
import TopSellingProductDateSelect from './Reports/TopSellingProductDateSelect';
import TopSellingCategoriesDateSelect from './Reports/TopSellingCategoriesDateSelect';

import CreditSaleReportDateSelection from './Reports/CreditSaleReportDateSelection';

import SalesReportDateSelect from './Reports/SalesReportDateSelect';
import ProductStockReportDateSelect from './Reports/ProductStockReportDateSelect';
import ProductStockReport from './Reports/ProductStockReport';
import TopCustomerReportDateSelect from './Reports/TopCustomerReportDateSelect';
import TopCustomerReport from './Reports/TopCustomerReport';
import CategorySelect from './screen/CategorySelect';
import Print from './screen/Print'
import PrintSales from './screen/PrintSales';
import VervebotLogo from './images/vervebotLogo.png'
import BarcodeForNewProduct from './components/BarcodeForNewProduct';
import ReportsByHours from './screen/ReportsByHours';
import QtyPromotion from './screen/QtyPromotion';
import MixMatchList from './screen/MixMatchList';
import MixMatchGroupDetail from './screen/MixMatchGroupDetail'
import PDFViewer from './components/PDFViewer';
import ExcelViewer from './components/ExcelViewer';

const Drawer = createDrawerNavigator();

const AppStack = ({ navigation, props }) => {
  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator();
  let is_manager;
  
  async function custom_Logout() {
    await AsyncStorage.removeItem('loginDb');
    await AsyncStorage.removeItem('access_token').then(() => {
      navigation.navigate('Home');
      // console.log('App Logging out');
    });
  }

  function Root() {

    AsyncStorage.getItem('is_pos_manager')
      .then(is_pos_manager => {
        // console.log('is_pos_manager : ', is_pos_manager);
        is_manager = is_pos_manager;
      })
      .catch(error => {
        alert('some error');
      });

    return (
      <Drawer.Navigator
        initialRouteName="Login"
        drawerContent={props => <CustomDrawer {...props} />}>

        <Drawer.Screen
          name="Home"
          component={Home}
          options={{
            //title: route.user_full_name,
            title: 'HOME',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerIcon: () => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                  marginRight: -20,
                  marginLeft: -5,
                }}
                source={require('../src/images/home.png')}
              />
            ),
          }}
        />

        <Drawer.Screen
          options={{
            title: 'PRODUCTS',
            style: { borderTopColor: '#CCC', borderTopWidth: 1 },
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerIcon: () => (
              <View>
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: -20,
                    marginLeft: -5,
                  }}
                  source={require('../src/images/product.png')}
                />
              </View>
            ),
          }}
          name="Product"
          component={Product}
        />

        <Drawer.Screen
          options={{
            title: 'PROMOTIONS',
            style: { borderTopColor: '#CCC', borderTopWidth: 1 },
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerIcon: () => (
              <View>
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: -20,
                    marginLeft: -5,
                  }}
                  source={require('.././src/images/promotion.png')}
                />
              </View>
            ),
          }}
          name="PromotionList"
          component={PromotionList}
        />

        {is_manager == 'true' ? <Drawer.Screen
          options={{
            title: 'REPORTS',
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerIcon: () => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                  marginRight: -20,
                  marginLeft: -5,
                }}
                source={require('../src/images/report_image.png')}
              />
            ),
          }}
          name="Reports"
          component={Reports}
        /> : null}

        {/* {is_manager == 'true' ? <Drawer.Screen
          options={{
            title: 'ICMS REPORTS',
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerIcon: () => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                  marginRight: -20,
                  marginLeft: -5,
                }}
                source={VervebotLogo}
              />
            ),
          }}
          name="InvoiceReports"
          component={InvoiceReports}
        /> : null} */}

        {is_manager == 'true' ? (
          <Drawer.Screen
            name="InvoiceReports" // Ensure this matches
            component={InvoiceReports}
            options={{
              title: 'ICMS REPORTS',
              headerStyle: {
                backgroundColor: '#3478F5',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              drawerIcon: () => (
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: -20,
                    marginLeft: -5,
                  }}
                  source={VervebotLogo}
                  resizeMode='contain'
                />
              ),
            }}
          />
        ) : null}

      </Drawer.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Root"
          component={Root}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="IcmsProductStallReport" component={IcmsProductStallReport} options={{ title: 'ICMS Products Stall Report' }} />
        <Stack.Screen name="InvoiceDataReport" component={InvoiceDataReport} options={{ title: 'Invoice Data Report' }} />
        <Stack.Screen name="IcmsInventoryReport" component={IcmsInvenotryReport} options={{ title: 'ICMS Inventory Report' }} />

        <Stack.Screen
          name="SalesSummaryReport"
          component={SalesSummaryReport}
        />
        <Stack.Screen name="SalesSummary" component={SalesSummary} />
        <Stack.Screen name="SalesByDepartment" component={SalesByDepartment} />
        <Stack.Screen name="CategorySelect" component={CategorySelect} />
        <Stack.Screen name="PaymentReport" component={PaymentReport}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen
          name="PaymentReportScreen"
          component={PaymentReportScreen}
          options={{
            headerShown: true,
            title: 'Sales Summary Report',
          }}
        />
        <Stack.Screen name="SessionList" component={SessionList} />
        <Stack.Screen
          name="Zreport"
          component={Zreport}
          options={{
            headerShown: true,
            title: ' ',
          }}
        />

        <Stack.Screen
          name="SalesByDepartmentReport"
          component={SalesByDepartmentReport}
        />
        <Stack.Screen
          name="ItemMovementReport"
          component={ItemMovementReport}
        />
        <Stack.Screen name="ItemMovement" component={ItemMovement} />
        <Stack.Screen name="EmployeeActivity" component={EmployeeActivity} />
        <Stack.Screen
          name="EmployeeActivityReport"
          component={EmployeeActivityReport}
        />
        <Stack.Screen name="TaxCollection" component={TaxCollection} />
        <Stack.Screen
          name="TopSellingProducts"
          component={TopSellingProducts}
          options={{
            headerShown: true,
            title: 'Top Selling Products',
          }}
        />
        <Stack.Screen
          name="PromotionList"
          component={PromotionList}
          options={{
            headerShown: true,
            title: 'PROMOTIONS',
          }}
        />
        <Stack.Screen
          name="TopSellingCategories"
          component={TopSellingCategories}
          options={{
            headerShown: true,
            title: 'Top Selling Categories',
          }}
        />
         <Stack.Screen
          name="CreditSaleReport"
          component={CreditSaleReport}
          options={{
            headerShown: true,
            title: 'Credit Sale Report',
          }}
        />
        <Stack.Screen name="SalesReport" component={SalesReport} />
        <Stack.Screen name="TopSellingProductDateSelect"
          component={TopSellingProductDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen name="TopSellingCategoriesDateSelect" component={TopSellingCategoriesDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
         <Stack.Screen name="CreditSaleReportDateSelection" component={CreditSaleReportDateSelection}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen name="SalesReportDateSelect" component={SalesReportDateSelect} />
        <Stack.Screen name="ProductStockReportDateSelect" component={ProductStockReportDateSelect} />
        <Stack.Screen name="ProductStockReport" component={ProductStockReport} />
        <Stack.Screen name="TopCustomerReportDateSelect" component={TopCustomerReportDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen name="TopCustomerReport" component={TopCustomerReport}
          options={{
            headerShown: true,
            title: 'Top Customers List',
          }}
        />
        <Stack.Screen name="Print" component={Print} />

        <Stack.Screen name="Reports" component={Reports} options={{ title: 'REPORTS' }} />
        <Stack.Screen name='ReportsByHours' component={ReportsByHours} options={{ title: 'HOURLY REPORTS' }} />
        <Stack.Screen name="PrintSales" component={PrintSales} options={{ title: 'PRINT SHEET' }} />

        <Stack.Screen
          name="SalesReportClicked"
          component={SalesReportClicked}
        />
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: 'ADD PRODUCT',
          }}
        />
        <Stack.Screen
          name="TaxCollectionReport"
          component={TaxCollectionReport}
        />
        <Stack.Screen
          name="Login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
          component={LoginForm}
        />
        <Stack.Screen
          name="Barcode"
          component={Barcode}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BarcodeScannerWithProps"
          component={BarcodeScannerWithProps}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BarcodeForNewProduct"
          component={BarcodeForNewProduct}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProductInformation"
          component={ProductInformation}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="QtyPromotion"
          component={QtyPromotion}
          options={{
            headerShown: true,
            title: 'Quantity Discount',
          }}
        />
        <Stack.Screen
          name="MixMatchList"
          component={MixMatchList}
          options={{
            headerShown: true,
            title: 'Mix Match Promotion List',
          }}
        />
        <Stack.Screen
          name="MixMatchGroupDetail"
          component={MixMatchGroupDetail}
          options={{
            headerShown: true,
            title: 'Mix Match Group Details',
          }}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewer}
          options={{
            headerShown: true,
            title: 'PDF Viewer',
          }}
        />
        <Stack.Screen
          name="ExcelView"
          component={ExcelViewer}
          options={{
            headerShown: true,
            title: 'PDF Viewer',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    color: 'white',
  },
  text: {
    fontSize: 30,
    color: 'white',
    marginTop: 70,
    textAlign: 'center',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default AppStack;
