import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator,Alert } from 'react-native';
import { List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


const PromotionList = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeUrl = await AsyncStorage.getItem('storeUrl');
                  const accessToken = await AsyncStorage.getItem('access_token');

                if (!storeUrl || !accessToken) {
                    throw new Error('Missing credentials');
                }

                const myHeaders = new Headers();
                myHeaders.append('access_token', accessToken);
                //  myHeaders.append('Cookie', 'session_id');

                const requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                };
                const response = await fetch(`${storeUrl}/api/promotion_list`, requestOptions);
                console.log("response:",response);
                const result = await response.json();
                console.log('accessToken:',accessToken);
                console.log("storeUrl:",storeUrl);
                console.log('promotion_list response:',response);
                if (result.length < 1) {
                    alert('No Promotions Found');
                } else {
                    setData(result);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error fetching data. Please try again.');
                setLoading(false);
                navigation.navigate('Home');
            }
        };
        fetchData();
    }, []);


    const handlePress = async (item) => {
        try {
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            //  myHeaders.append('Cookie', 'session_id');
            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
              credentials: 'omit',

            };

            const response = await fetch(`${storeUrl}/api/get_promotion_details?promotion_id=${item.id}`, requestOptions);
            const promotionDetails = await response.json();
            if (promotionDetails.offer_type === 'discount_mixed_matching_products') {
                navigation.navigate('MixMatchList', { id: item.id });
            } else if (promotionDetails.offer_type === 'fixed_discount_on_products') {
                navigation.navigate('QtyPromotion', { id: item.id });
            } else {
                // Handle other cases
                alert('Promotion Type Not Activated');
            }
        } catch (error) {
            console.error('Error fetching promotion details:', error);
            alert('Error fetching promotion details. Please try again.');
        }
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={item.name}
            key={item.id.toString()}
            left={props => <List.Icon {...props} icon="arrow-right-box" />}
            onPress={() => handlePress(item)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
};

export default PromotionList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
