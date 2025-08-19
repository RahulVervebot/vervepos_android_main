import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerActions} from '@react-navigation/native';
import Home from './screen/Home';
import Reports from './screen/Reports';
import InvoiceReports from './screen/InvoiceReports';
import IcmsProductStallReport from './Reports/IcmsProductStallReport';
import InvoiceDataReport from './Reports/InvoiceDataReport';
import IcmsInvenotryReport from './Reports/IcmsInventoryReport';
import SalesSummaryReport from './screen/SalesSummaryReport';
import SalesSummary from './Reports/SalesSummary';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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
import WebViewScreen from './components/WebViewScreen'; // Your newly created WebView screen
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
import Print from './screen/Print';
import PrintSales from './screen/PrintSales';
import VervebotLogo from './images/vervebotLogo.png';
import BarcodeForNewProduct from './components/BarcodeForNewProduct';
import ReportsByHours from './screen/ReportsByHours';
import QtyPromotion from './screen/QtyPromotion';
import MixMatchList from './screen/MixMatchList';
import MixMatchGroupDetail from './screen/MixMatchGroupDetail';
import PDFViewer from './components/PDFViewer';
import ExcelViewer from './components/ExcelViewer';
import AccountDashboard from './accountant/AccountDashboard';
import SingleManagerDetails from './accountant/SingleManagerDetails';
import DepartmentPOData from './manager/components/DepatmentsAccess/DepartmentPOData';
import PONextWeek from './manager/components/DepatmentsAccess/DepartmentPONextWeek';
import ManagerDashboard from './manager/components/DepatmentsAccess/ManagerDashboard';
import VendorManagerDashboard from './manager/components/VendorAccess/ManagerDashboard';
import DepartmentAccount from './accountant/DepartmentAccount';
import ManagerRequest from './accountant/departmentAccess/ManagerRequest';
import SingleDepartment from './accountant/SingleDepartment';
import DepartmentBudgetCurrentWeek from './accountant/departmentAccess/DepartmentBudgetCurrentWeek';
import OrderReport from './manager/components/DepatmentsAccess/OrderReport';
import InvoiceScannerWarehouse from './components/OcrCameraScreen';
import StoreManagerOrder from './store/ManagerOrder';
import StoreReport from './store/StoreReport';
import QuotationReport from './store/QuotationReport';
import DepartmentBudgetNextWeek from './accountant/departmentAccess/DepartmentBudgetNextWeek';
import DepartmentRequestAmount from './manager/components/DepatmentsAccess/RequestAmount';
import DepartmentRequestBudgetNextWeek from './manager/components/DepatmentsAccess/RequestNextWeekAmount';
import DepartmentReport from './manager/components/DepatmentsAccess/DepartmentReport';
import UpdatePO from './manager/components/DepatmentsAccess/UpdatePO';
import VendorCatalogue from './manager/components/DepatmentsAccess/VendorCatalogue';
import {fetchManageOrderReport} from '../src/functions/DepartmentAccess/function_dep';

import ICMS_invoice from './screen/ICMS_invoice.js';
import ICMS_VendorList from './screen/ICMS_VendorList.js';
import InvoiceDetails from './screen/InvoiceDetails.js';

const Drawer = createDrawerNavigator();

function Root() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernameState, setIUsernameState] = useState();
  const [appType, setAppType] = useState(null);
  const [currentweekData, setCurrentWeekData] = useState(null);
  const [nextweekData, setNextWeekData] = useState(null);
  const [is_manager, setIs_Manager] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        // 1) Make sure userRole is empty BEFORE we fetch new data
        setUserRole(null);
        setLoading(true);
        setIs_Manager(null);
        // 2) Fetch fresh data from AsyncStorage
        const roleFromStorage = await AsyncStorage.getItem('user_role');
        const apptype = await AsyncStorage.getItem('apptype');
        const is_pos_manager = await AsyncStorage.getItem('is_pos_manager');
        setIs_Manager(is_pos_manager);
        setAppType(apptype);
        AsyncStorage.getItem('username').then(username => {
          console.log('username : ', username);
          setIUsernameState(username);
        });
        console.log('app user role', roleFromStorage);
        // 3) Update state
        setUserRole(roleFromStorage);
      } catch (err) {
        console.warn('Error fetching user data:', err);
      } finally {
        // 4) We are done loading regardless of success/fail
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const daysUntilMonday = (dayOfWeek + 6) % 7;
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysUntilMonday);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      const startDatecurr = `${String(startDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(startDate.getDate()).padStart(
        2,
        '0',
      )}-${startDate.getFullYear()}`;
      const endDatecurr = `${String(endDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(endDate.getDate()).padStart(
        2,
        '0',
      )}-${endDate.getFullYear()}`;
      console.log('startDate', startDate, endDate);
      const currentData = await fetchManageOrderReport(
        startDate,
        endDate,
        setCurrentWeekData,
        setLoading,
      );

      console.log('currentweekData:', currentweekData.length);

      //  for next week
      const daysMonday = (1 - dayOfWeek + 6) % 7;
      const starnexttDate = new Date(currentDate);
      starnexttDate.setDate(currentDate.getDate() + daysMonday + 1);
      starnexttDate.setHours(0, 0, 0, 0);
      const endnextDate = new Date(starnexttDate);
      endnextDate.setDate(starnexttDate.getDate() + 6);
      endnextDate.setHours(23, 59, 59, 999);
      console.log('starnexttDate', starnexttDate, endnextDate);
      const nextData = await fetchManageOrderReport(
        starnexttDate,
        endnextDate,
        setNextWeekData,
        setLoading,
      );
      console.log('nextData', nextweekData);
    };
    initializeData();
  }, []);

  AsyncStorage.getItem('ManageAccount');

  if (loading === 'true') {
    return (
      <ActivityIndicator
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        size="large"
      />
    );
  } else {
    return (
      <Drawer.Navigator
        // We do *not* set initialRouteName="Login" here,
        // because "Login" is in the Stack, not the Drawer.
        drawerContent={props => <CustomDrawer {...props} />}>
        {userRole === 'manager' ? (
          <>
            <Drawer.Screen
              name="VendorManagerDashboard"
              component={VendorManagerDashboard}
              options={{
                title: 'MANAGER DASHBOARD',
                headerRight: () => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <Image
                      source={require('./images/Profileicon.png')}
                      style={{width: 24, height: 24, marginRight: 5}}
                    />
                    <Text style={{color: '#000'}}>{usernameState}</Text>
                  </View>
                ),
              }}
            />

            {/* {currentweekData == null ? (
           
            ) : null} */}
            <Drawer.Screen
              name="DepartmentPOData"
              component={DepartmentPOData}
              options={{title: 'CREATE PO'}}
            />
            <Drawer.Screen
              name="UpdatePO"
              component={UpdatePO}
              options={{title: 'UPDATE PO'}}
            />
            <Drawer.Screen
              name="PONextWeek"
              component={PONextWeek}
              options={{title: 'PO NEXT WEEK'}}
            />
            {/* {nextweekData == null ? (
              
            ) : null} */}

            <Drawer.Screen
              name="DepartmentRequestAmount"
              component={DepartmentRequestAmount}
              options={{title: 'REQUEST BUDGET'}}
            />
            <Drawer.Screen
              name="DepartmentRequestBudgetNextWeek"
              component={DepartmentRequestBudgetNextWeek}
              options={{title: 'NEXT WEEK BUDGET'}}
            />
            <Drawer.Screen
              name="VendorCatalogue"
              component={VendorCatalogue}
              options={{title: 'VENDOR CATALOGUE'}}
            />

            <Drawer.Screen
              name="OrderReport"
              component={OrderReport}
              options={{title: 'VENDOR REPORT'}}
            />
            <Drawer.Screen
              name="DepartmentReport"
              component={DepartmentReport}
              options={{
                title: 'DEPARTMENT REPORT',
                headerRight: () => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <Image
                      source={require('./images/Profileicon.png')}
                      style={{width: 24, height: 24, marginRight: 5}}
                    />
                    <Text style={{color: '#000'}}>{usernameState}</Text>
                  </View>
                ),
              }}
            />

            {appType === 'warehouse' ? (
              <Drawer.Screen
                name="InvoiceScannerWarehouse"
                component={InvoiceScannerWarehouse}
                options={{title: 'Scan Invoice'}}
              />
            ) : null}
          </>
        ) : userRole === 'account_manager' ? (
          <>
            <Drawer.Screen
              name="DepartmentAccount"
              component={DepartmentAccount}
              options={{
                title: 'ACCOUNT DASHBOARD',

                headerRight: () => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <Image
                      source={require('./images/Profileicon.png')}
                      style={{width: 24, height: 24, marginRight: 5}}
                    />
                    <Text style={{color: '#000'}}>{usernameState}</Text>
                  </View>
                ),
              }}
            />
            <Drawer.Screen
              name="OrderReport"
              component={OrderReport}
              options={{title: 'Vendor Report'}}
            />
            <Drawer.Screen
              name="DepartmentReport"
              component={DepartmentReport}
              options={{title: 'Department Report'}}
            />
            <Drawer.Screen
              name="DepartmentBudgetCurrentWeek"
              component={DepartmentBudgetCurrentWeek}
              options={{title: 'Department Budget'}}
            />
            <Drawer.Screen
              name="DepartmentBudgetNextWeek"
              component={DepartmentBudgetNextWeek}
              options={{title: 'Next Week Budget'}}
            />
           
            <Drawer.Screen
              name="ManagerRequest"
              component={ManagerRequest}
              options={{title: 'Budget Request'}}
            />
          </>
        ) : userRole === 'store_manager' ? (
          <>
            <Drawer.Screen
              name="StoreManagerOrder"
              component={StoreManagerOrder}
              options={{title: 'Order'}}
            />

            <Drawer.Screen
              name="StoreReport"
              component={StoreReport}
              options={{title: 'Manage Orders'}}
            />

            <Drawer.Screen
              name="QuotationReport"
              component={QuotationReport}
              options={{title: 'Quotation Reports'}}
            />
          </>
        ) : (
          <>
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
                style: {borderTopColor: '#CCC', borderTopWidth: 1},
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
                style: {borderTopColor: '#CCC', borderTopWidth: 1},
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
 <Drawer.Screen
              options={{
                title: 'ICMS Invoice',
                style: {borderTopColor: '#CCC', borderTopWidth: 1},
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
              name="ICMS Invoice"
              component={ICMS_VendorList}
            />

            {is_manager == 'true' ? (
              <Drawer.Screen
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
              />
            ) : null}

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
                      resizeMode="contain"
                    />
                  ),
                }}
              />
            ) : null}
          </>
        )}
      </Drawer.Navigator>
    );
  }
}

const AppStack = ({navigation, props}) => {
  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // const userRole = await AsyncStorage.getItem('user_role');
        const AccessToken = await AsyncStorage.getItem('access_token');
        console.log('token test', AccessToken);
        // If a userRole exists, we route them to the "Root" (or any authorized area).
        // Otherwise, we fall back to "Login".
        if (AccessToken) {
          setInitialRoute('Root');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error reading user_role from AsyncStorage:', error);
        // Even on error, we might prefer to route to Login as a fallback
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  if (isLoading || initialRoute == null) {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginForm}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Root"
          component={Root}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="InvoiceDetails"
          component={InvoiceDetails}
          options={{title: 'InvoiceDetails'}}
        />
        <Stack.Screen
          name="InvoiceList"
          component={ICMS_invoice}
          options={{
            title: 'Product Information',
            headerStyle: {
              backgroundColor: '#3478F5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />

        <Stack.Screen
          name="IcmsProductStallReport"
          component={IcmsProductStallReport}
          options={{title: 'ICMS Products Stall Report'}}
        />
        <Stack.Screen
          name="InvoiceDataReport"
          component={InvoiceDataReport}
          options={{title: 'Invoice Data Report'}}
        />
        <Stack.Screen
          name="IcmsInventoryReport"
          component={IcmsInvenotryReport}
          options={{title: 'ICMS Inventory Report'}}
        />

        <Stack.Screen
          name="SalesSummaryReport"
          component={SalesSummaryReport}
        />
        <Stack.Screen name="SalesSummary" component={SalesSummary} />
        <Stack.Screen name="SalesByDepartment" component={SalesByDepartment} />
        <Stack.Screen name="CategorySelect" component={CategorySelect} />
        <Stack.Screen
          name="PaymentReport"
          component={PaymentReport}
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
        <Stack.Screen
          name="TopSellingProductDateSelect"
          component={TopSellingProductDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen
          name="TopSellingCategoriesDateSelect"
          component={TopSellingCategoriesDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen
          name="CreditSaleReportDateSelection"
          component={CreditSaleReportDateSelection}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen
          name="SalesReportDateSelect"
          component={SalesReportDateSelect}
        />
        <Stack.Screen
          name="ProductStockReportDateSelect"
          component={ProductStockReportDateSelect}
        />
        <Stack.Screen
          name="ProductStockReport"
          component={ProductStockReport}
        />
        <Stack.Screen
          name="TopCustomerReportDateSelect"
          component={TopCustomerReportDateSelect}
          options={{
            headerShown: true,
            title: ' Select Date',
          }}
        />
        <Stack.Screen
          name="TopCustomerReport"
          component={TopCustomerReport}
          options={{
            headerShown: true,
            title: 'Top Customers List',
          }}
        />
        <Stack.Screen name="Print" component={Print} />

        <Stack.Screen
          name="Reports"
          component={Reports}
          options={{title: 'REPORTS'}}
        />
        <Stack.Screen
          name="ReportsByHours"
          component={ReportsByHours}
          options={{title: 'HOURLY REPORTS'}}
        />
        <Stack.Screen
          name="PrintSales"
          component={PrintSales}
          options={{title: 'PRINT SHEET'}}
        />

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
        <Stack.Screen
          name="AccountDashboard"
          component={AccountDashboard}
          options={{title: 'Select Manager'}}
        />
        <Stack.Screen
          name="SingleManagerDetails"
          component={SingleManagerDetails}
          options={{
            title: 'Manager Details',
          }}
        />
        <Stack.Screen
          name="ManagerDashboard"
          component={ManagerDashboard}
          options={{
            title: 'Manager Dashboard',
            headerBackVisible: false, // Works in React Navigation v6+
          }}
        />
        <Stack.Screen
          name="VendorManagerDashboard"
          component={VendorManagerDashboard}
          options={{
            title: 'Manager Dashboard',
            headerBackVisible: false, // Works in React Navigation v6+
          }}
        />
        <Stack.Screen name="SingleDepartment" component={SingleDepartment} />
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
