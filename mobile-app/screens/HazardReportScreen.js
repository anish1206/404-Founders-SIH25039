// /mobile-app/screens/HazardReportScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
    Appbar,
    TextInput,
    Button,
    Card,
    Title,
    Text,
    ActivityIndicator,
} from 'react-native-paper';
import { auth } from '../firebase';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// --- OFFLINE SUPPORT IMPORTS ---
import { useNetInfo } from '@react-native-community/netinfo';
import { addToOfflineQueue, getOfflineQueue } from '../services/offlineService';

export default function HazardReportScreen({ navigation }) {
    // Form State
    const [description, setDescription] = useState('');
    const [hazardType, setHazardType] = useState('');

    // Data State
    const [location, setLocation] = useState(null);
    const [imageUri, setImageUri] = useState(null);

    // UI State
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- OFFLINE SUPPORT STATE ---
    const [offlineReportsCount, setOfflineReportsCount] = useState(0);
    const netInfo = useNetInfo();

    // Effect hook to get location (no changes)
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
            } catch (error) {
                setErrorMsg('Could not fetch location. Make sure GPS is on.');
            }
        })();
    }, []);

    // --- NEW EFFECT: Update the offline queue count when the screen is shown ---
    useEffect(() => {
        const updateQueueCount = async () => {
          const queue = await getOfflineQueue();
          setOfflineReportsCount(queue.length);
        };
        // We'll use a listener to refresh when the screen is focused
        // For now, this runs on mount and when network state changes.
        updateQueueCount();
      }, [netInfo.isConnected]);

    // Image picker functions
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'We need camera roll permissions to select images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'We need camera permissions to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };




    // --- HELPER FUNCTION: Contains the logic to submit a single report to the server ---
    // This is extracted so it can be reused by the offline sync service in App.js
    const submitReportToServer = async (reportData) => {
        // Check if required environment variables are set
        if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary configuration is missing. Please check your .env file.');
        }
        
        if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
            throw new Error('API base URL is missing. Please check your .env file.');
        }

        console.log('=== UPLOADING IMAGE TO CLOUDINARY ===');
        const formData = new FormData();
        formData.append('file', {
            uri: reportData.imageUri, // Use the imageUri from the report data
            type: `image/${reportData.imageUri.split('.').pop()}`,
            name: `upload.${reportData.imageUri.split('.').pop()}`,
        });
        formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        const cloudinaryRes = await axios.post(cloudinaryUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        });
        
        const mediaUrl = cloudinaryRes.data.secure_url;
        if (!mediaUrl) { throw new Error('Failed to get media URL from Cloudinary'); }
        console.log('✅ Cloudinary upload successful. Media URL:', mediaUrl);

        console.log('=== SUBMITTING REPORT TO SERVER ===');
        // Prepare the final data packet for our backend
        const finalReportData = {
            longitude: reportData.longitude,
            latitude: reportData.latitude,
            description: reportData.description,
            mediaUrl: mediaUrl, // Use the new Cloudinary URL
            hazardType: reportData.hazardType,
            submittedBy: reportData.submittedBy,
        };

        const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/reports`;
        await axios.post(apiEndpoint, finalReportData, { timeout: 15000 });
        console.log('✅ Report submission successful');
    };


    // --- MODIFIED handleSubmit with OFFLINE LOGIC ---
    const handleSubmit = async () => {
        console.log('=== STARTING SUBMISSION PROCESS ===');
        if (!location || !imageUri || !description || !hazardType) {
            Alert.alert('Incomplete Form', 'Please fill all fields and ensure location is available');
            return;
        }

        // Prepare the report data object. It includes the local imageUri for now.
        const reportData = {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            description: description,
            hazardType: hazardType,
            submittedBy: auth.currentUser?.email,
            imageUri: imageUri, // The local file path to the image
        };

        const resetForm = () => {
            setDescription('');
            setHazardType('');
            setImageUri(null);
        };

        if (netInfo.isConnected === true) {
            console.log('Network status: ONLINE. Attempting direct submission.');
            setIsSubmitting(true);
            try {
                await submitReportToServer(reportData);
                Alert.alert('Success!', 'Your report has been submitted.');
                resetForm();
            } catch (error) {
                console.error('Direct submission failed, saving to offline queue.', error.message);
                Alert.alert('Submission Failed', 'Could not connect to the server. Your report has been saved and will be sent later.');
                await addToOfflineQueue(reportData);
                resetForm();
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Network status: OFFLINE. Saving report to local queue.');
            await addToOfflineQueue(reportData);
            Alert.alert('You Are Offline', 'Your report has been saved locally. It will be submitted automatically when you reconnect.');
            resetForm();
        }

        // Always update the queue count badge after any submission attempt
        const queue = await getOfflineQueue();
        setOfflineReportsCount(queue.length);
        console.log('=== SUBMISSION PROCESS COMPLETE ===');
    };


    // Display text for location status (no changes)
    let locationText = 'Waiting for location...';
    if (errorMsg) {
        locationText = errorMsg;
    } else if (location) {
        locationText = `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`;
    }

    return (
        <View style={styles.flexContainer}>
            <Appbar.Header>
                <Appbar.Content title="Report Ocean Hazard" />
                {/* --- NEW UI FOR OFFLINE STATUS --- */}
                {netInfo.isConnected === false && <Text style={styles.offlineText}>Offline</Text>}
                {offlineReportsCount > 0 && (
                    <View style={styles.queueBadge}>
                        <Text style={styles.queueText}>{offlineReportsCount}</Text>
                    </View>
                )}
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        {/* ... (The rest of your form JSX is identical) ... */}
                        <Title>New Hazard Report</Title>
                        <Text style={styles.locationText}>Your Location: {locationText}</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={hazardType} onValueChange={(itemValue) => setHazardType(itemValue)}>
                                <Picker.Item label="Select Hazard Type..." value="" />
                                <Picker.Item label="High Waves" value="High Waves" />
                                <Picker.Item label="Storm Surge" value="Storm Surge" />
                                <Picker.Item label="Tsunami" value="Tsunami" />
                                <Picker.Item label="Abnormal Sea Behavior" value="Abnormal" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>
                        <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={4} style={styles.input} />
                        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
                        <View style={styles.buttonRow}>
                            <Button icon="image-album" mode="contained" onPress={pickImage} style={styles.button}>Gallery</Button>
                            <Button icon="camera" mode="contained" onPress={takePhoto} style={styles.button}>Camera</Button>
                        </View>
                        {isSubmitting ? (
                            <ActivityIndicator animating={true} color={'navy'} size="large" style={styles.spinner} />
                        ) : (
                            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>Submit Report</Button>
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (All your existing styles are perfect)
    flexContainer: { flex: 1 },
    container: { backgroundColor: '#f5f5f5', padding: 16, paddingBottom: 32 },
    card: { elevation: 4 },
    input: { marginBottom: 16 },
    locationText: { marginBottom: 16, fontSize: 16, color: 'gray', textAlign: 'center', fontWeight: 'bold' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
    button: { flex: 1, marginHorizontal: 4 },
    submitButton: { marginTop: 16, paddingVertical: 4, backgroundColor: 'navy' },
    imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ddd' },
    spinner: { marginTop: 16 },
    pickerContainer: { borderColor: 'gray', borderWidth: 1, borderRadius: 4, marginBottom: 16 },
    
    // --- NEW STYLES FOR OFFLINE UI ---
    offlineText: { color: 'white', marginRight: 10, fontStyle: 'italic' },
    queueBadge: {
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    queueText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});