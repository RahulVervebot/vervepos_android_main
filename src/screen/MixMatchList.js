import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { List, Button, TextInput, Dialog, Portal, Provider } from 'react-native-paper';

const MixMatchList = ({ route, navigation }) => {
    const { id } = route.params; // Get the id passed from PromotionList
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGroupName, setNewGroupName] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [grouoading, setGroupLoading] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedGroupIdToDelete, setSelectedGroupIdToDelete] = useState(null);
 const [selectedGroupNameToDelete, setSelectedGroupNameToDelete] = useState(null);
    const deleteGroup = async () => {
        try {
            setLoading(true);
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            myHeaders.append('Content-Type', 'application/json');
            // myHeaders.append('Cookie', 'session_id');
            console.log("selectedGroupIdToDelete:", selectedGroupIdToDelete);
            const payload = { group_id: selectedGroupIdToDelete };

            const requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: 'follow',
                  credentials: 'omit',
            };

            const response = await fetch(`${storeUrl}/api/delete/discount/promotion`, requestOptions);
            const result = await response.json();
            console.log("Delete result", result);

            if (result.result && result.result.success) {
                setData(prev => prev.filter(item => item.group_id !== selectedGroupIdToDelete));
            } else {
                alert('Failed to delete the group.');
                console.log("delete feild:", result);
            }
        } catch (error) {
            console.error("Error deleting group:", error);
            alert('Error deleting the group.');
        } finally {
            setDeleteDialogVisible(false);
            setSelectedGroupIdToDelete(null);
            setSelectedGroupNameToDelete(null);
            setLoading(false);
        }
    };


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
                // myHeaders.append('Cookie', 'session_id');

                const requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                };
                console.log("id:", id);
                const response = await fetch(`${storeUrl}/api/get_group_ids/${id}`, requestOptions);
                const result = await response.json();
                console.log('get_group_ids raw response →', result);
                if (result.length < 1) {
                    alert('No Promotions Found');
                } else {
                    const detailedData = await Promise.all(
                        result.map(async (item) => {
                            const groupDetailResponse = await fetch(`${storeUrl}/api/get_group_detail/${item.group_id}`, requestOptions);
                            const groupDetail = await groupDetailResponse.json();
                            return { ...item, status: groupDetail.status };
                        })
                    );
                    setData(detailedData);
                    // console.log("setData Group Details", detailedData);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleItemPress = (item) => {
        // console.log("Data in MixMatchList", item);
        // console.log(`Clicked item: ${item.name}`);
        navigation.navigate('MixMatchGroupDetail', { group_id: item.group_id });
    };

    const createNewGroup = async () => {
        try {
            setGroupLoading(true)
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const requestData = {
                name: newGroupName,
                no_of_products_to_buy: 1,
                no_of_free_products: 0,
                status: true,
                product_ids: [],
                discount_product_ids: [],
                sale_price: 0,
            };
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow',
                body: JSON.stringify(requestData),
                  credentials: 'omit',
            };
            const response = await fetch(`${storeUrl}/api/discount_product_group`, requestOptions);
            const result = await response.json();
            console.log("result group", result);
            setGroupLoading(false);
            if (result.result) {
                if (result.result.success) {
                    const newGroupId = result.result.data.id;
                    const newGroupName = result.result.data.name;
                    const newGroup = { group_id: newGroupId, name: newGroupName };
                    setData(prevData => [...prevData, newGroup]);
                    setDialogVisible(false);
                    setGroupLoading(false);
                } else {
                    console.log('Failed to create new group:', result.result);
                    alert('Failed to create new group. Please try again.');
                    setGroupLoading(false);
                }
            } else {
                setGroupLoading(false)
                alert('Please try Again');
            }
        } catch (error) {
            setGroupLoading(false);
            console.error('Error creating new group:', error);
            alert('Error creating new group. Please try again.');
        }
    };

    const renderItem = ({ item }) => (
        <>

            <List.Item
                title={props => (
                    <Text style={[styles.itemText, item.status === false ? styles.blurredText : null]}>
                        {item.name}
                    </Text>
                )}
                  contentContainerStyle={{ paddingBottom: 100 }}

                key={item.group_id.toString()}
                left={props => <List.Icon {...props} icon="arrow-right-box" />}
                right={props => (
                    <Button
                        icon="delete"
                        onPress={() => {
                            setSelectedGroupIdToDelete(item.group_id);
                            setSelectedGroupNameToDelete(item.name)
                            setDeleteDialogVisible(true);
                            
                        }}
                            style={{ padding: 10 }}

                        compact
                        textColor="red"
                    />
                )}
                onPress={() => handleItemPress(item)}
            />

        </>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <Provider>
            <View style={styles.container}>
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.group_id.toString()}
                      contentContainerStyle={{ paddingBottom: 100 }}

                />
                 <Button mode="contained" onPress={() => setDialogVisible(true)} style={styles.createButton}>
                    Create New Group
                </Button>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={dialogVisible}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Create New Group</Text>
                        <TextInput
                            label="Group Name"
                            value={newGroupName}
                            onChangeText={setNewGroupName}
                            style={styles.input}
                        />
                        {grouoading ?
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator animating={true} size="large" />
                            </View>
                            :
                            <Button mode="contained" onPress={createNewGroup} style={styles.modalCloseButton} labelStyle={styles.whiteButtonLabel}
                            >
                                Create Group
                            </Button>
                        }
                        <Button mode="contained" onPress={() => setDialogVisible(false)} style={styles.modalCloseButton} labelStyle={styles.whiteButtonLabel}
                        >
                            Cancel

                        </Button>
                    </View>
                </Modal>
                <Portal>
                    <Dialog
                        visible={deleteDialogVisible}
                        onDismiss={() => setDeleteDialogVisible(false)}
                    >
                        <Dialog.Title>Confirm Delete</Dialog.Title>
                        <Dialog.Content>
                            <Text style={{color:"#fff"}}>Are you sure you want to delete {selectedGroupNameToDelete}?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                            <Button onPress={deleteGroup}>Delete</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    );
};

export default MixMatchList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButton: {
        margin: 16,
    },
    itemText: {
        fontSize: 16,
    },
    blurredText: {
        color: 'gray',
        opacity: 0.5,
        // textDecorationLine: 'line-through', // You can add more styling to indicate a blurred or disabled item
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        padding: 20,
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        alignSelf: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff', // dark background
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
        color: '#000', // fallback if not using Paper theme
    },
    modalCloseButton: {
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#3478F6', // You can adjust this
        paddingVertical: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    whiteButtonLabel: {
        color: '#fff', // black text for contrast
        fontWeight: 'bold',
    },

});