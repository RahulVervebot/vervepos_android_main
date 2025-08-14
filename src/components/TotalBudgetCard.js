import React, { useEffect, useState,useCallback } from 'react';
import { View, StyleSheet,TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Text, ProgressBar } from 'react-native-paper';
import { fetchAsyncValuesAndCheckStatus, getTotalAllocationCurrentWeek } from '../functions/DepartmentAccess/function_dep';
import { useFocusEffect } from '@react-navigation/native';
const TotalBudgetCard = ({ budgetloading, startDateFormatted, endDateFormatted, activeDepartmentBudget, totalspend }) => {
 const [appType, setAppType] = useState(null);
  useEffect(() => {
    const initializeData = async () => {
      const now = new Date();
      const apptype = await AsyncStorage.getItem('apptype');
      setAppType(apptype);
    };
    initializeData();
  }, []);
  return (

            <View>
              <View
                style={{
                  padding: '3%',
                }}>
    <View style={styles.row}>
        <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <View style={styles.budgetcontainer}>
           
                        <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                           ALLOCATED BUDGET
                        </Text>
                        {budgetloading ?
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#2B6FA0' }}>
                            Loading
                          </Text>
                          :
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#2B6FA0' }}>
                           ${activeDepartmentBudget?.data?.[0]?.allocated_amount
                ? activeDepartmentBudget.data[0].allocated_amount.toFixed(2) 
                : 0}
                          </Text>
                        }
                     
                    </View>
                    <View style={styles.budgetusedcontainer}>
                
                        <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                          USED BUDGET
                        </Text>
                        {budgetloading ?
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#C80122' }}>
                            Loading
                          </Text>
                          :
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#C80122' }}>
                           ${activeDepartmentBudget?.data?.[0]?.remainingPOBalance ? (activeDepartmentBudget.data[0].allocated_amount - activeDepartmentBudget.data[0].remainingPOBalance).toFixed(2): 0}
                          </Text>
                        }
                   
                    </View>
                    <View style={styles.budgethandcontainer}>
                    
                        <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                          BUDGET IN HAND
                        </Text>
                        {budgetloading ?
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#166434' }}>
                            Loading
                          </Text>
                          :
                          <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#166434' }}>
                          $
                {activeDepartmentBudget?.data?.[0]?.remainingPOBalance
                  ? activeDepartmentBudget.data[0].remainingPOBalance.toFixed(2)
                  : 0}
                
                          </Text>
                        }
      
                
                    </View>
                  </View>
    </View>
    </View>
    </View>
  );
};

export const useBudgetData = () => {
  const [budgetloading, setBudgetLoading] = useState(true);
  const [activeDepartmentBudget, setActiveDepartmentBudget] = useState({ data: [] });
  const [startDateFormatted, setStartDateFormatted] = useState('');
  const [endDateFormatted, setEndDateFormatted] = useState('');
  const [totalspend, setTotalSpend] = useState(1);
   useFocusEffect(
      useCallback(() => {
        fetchData();
      }, [fetchData])
    );

        const fetchData = useCallback(async () => {

      setBudgetLoading(true);
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const daysUntilMonday = (dayOfWeek + 6) % 7;
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysUntilMonday);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      setStartDateFormatted(
        `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}-${startDate.getFullYear()}`
      );
      setEndDateFormatted(
        `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}-${endDate.getFullYear()}`
      );

      await fetchAsyncValuesAndCheckStatus();
      const ActiveDept = await getTotalAllocationCurrentWeek();
      setActiveDepartmentBudget(ActiveDept);
      setBudgetLoading(false);
    }, []);

  return { budgetloading, startDateFormatted, endDateFormatted, activeDepartmentBudget, totalspend };
};

const styles = StyleSheet.create({
  row: {
    marginHorizontal: '2%',
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topcard: {
    backgroundColor: '#2C62FF',
    width: '100%',
    padding: 10,
  },
  titleTextWhite: {
    color: '#fff',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetrow:{
    flexDirection:'row',
  },
  budgetcontainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    marginTop: 10,
    padding: 25,
    width: '32%',
    borderColor: '#000',
    shadowColor: '#000',
    // Bottom Border
    borderBottomWidth: 10,
    borderBottomColor: '#2B6FA0',
    // Rounded Bottom Corners
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
  },
  budgetusedcontainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    marginTop: 10,
    padding: 25,
    width: '32%',
    borderColor: '#000',
    shadowColor: '#000',
    borderBottomWidth: 10,
    borderBottomColor: '#C80122',
    // Rounded Bottom Corners
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
  },
  budgethandcontainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    marginTop: 10,
    padding: 25,
    width: '32%',
    borderColor: '#000',
    shadowColor: '#000',
    borderBottomWidth: 10,
    borderBottomColor: '#166434',
    // Rounded Bottom Corners
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
  },
});

export default TotalBudgetCard;
