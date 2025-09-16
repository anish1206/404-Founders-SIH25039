// mobile-app/screens/HazardReportScreen.js

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

export default function HazardReportScreen() {
    // Form State
    const [description, setDescription] = useState('');
    const [hazardType, setHazardType] = useState('');

    // Data State
    const [location, setLocation] = useState(null);
    const [imageUri, setImageUri] = useState(null);

    // UI State
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This effect hook runs once when the component loads to get location
    useEffect(() => {
        (async () => {
            // Request permission to access the user's location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                Alert.alert('Permission Denied', 'Please enable location services to submit a report.');
                return;
            }

            // Get the current position
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
            } catch (error) {
                setErrorMsg('Could not fetch location. Make sure GPS is on.');
                console.error("Error fetching location: ", error);
            }
        })();
    }, []);

    // Function to let the user pick an image from their library
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // Compress image to 50% quality
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Function to let the user take a new photo
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'You need to grant camera access to take a photo.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Function to sign the user out
    const handleSignOut = () => {
        auth.signOut().catch(error => alert(error.message));
    };

    // --- MAIN SUBMISSION LOGIC ---
    const handleSubmit = async () => {
        // Inside handleSubmit
        if (!location || !imageUri || !description || !hazardType) { // The !hazardType check now works for the empty value ""
            Alert.alert('Incomplete Form', 'Please fill all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // STEP 1: Upload Image to Cloudinary
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: `image/${imageUri.split('.').pop()}`,
                name: `upload.${imageUri.split('.').pop()}`,
            });
            formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

            const cloudinaryRes = await axios.post(cloudinaryUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // 30 second timeout
            });

            const mediaUrl = cloudinaryRes.data.secure_url;
            if (!mediaUrl) {
                throw new Error('Failed to get media URL from Cloudinary.');
            }

            // STEP 2: Submit Complete Report to Your Backend Server
            const reportData = {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                description: description,
                mediaUrl: mediaUrl,
                hazardType: hazardType,
                submittedBy: auth.currentUser?.email, // Add the logged-in user's email
            };

            const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/reports`;
            await axios.post(apiEndpoint, reportData, {
                timeout: 15000, // 15 second timeout
            });

            // STEP 3: Handle Success
            Alert.alert('Success!', 'Your hazard report has been submitted successfully.');

            // Reset the form to its initial state
            setDescription('');
            setHazardType('');
            setImageUri(null);

        } catch (error) {
            console.error('Submission Error:', error.response ? error.response.data : error.message);

            // More specific error messages
            let errorMessage = 'An error occurred. Please check your connection and try again.';

            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                errorMessage = 'Network error. Please check your internet connection and server availability.';
            } else if (error.response) {
                // Server responded with an error
                errorMessage = `Server error: ${error.response.data.msg || error.response.statusText}`;
            } else if (error.message.includes('Cloudinary')) {
                errorMessage = 'Failed to upload image. Please try again.';
            }

            Alert.alert('Submission Failed', errorMessage);
        } finally {
            setIsSubmitting(false); // Hide loading spinner regardless of outcome
        }
    };

    // Display text for location status
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
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>New Hazard Report</Title>

                        <Text style={styles.locationText}>Your Location: {locationText}</Text>

                        {/* Container for the Picker to style it like a TextInput */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={hazardType}
                                onValueChange={(itemValue, itemIndex) =>
                                    setHazardType(itemValue)
                                }
                            >
                                <Picker.Item label="Select Hazard Type..." value="" />
                                <Picker.Item label="High Waves" value="High Waves" />
                                <Picker.Item label="Storm Surge" value="Storm Surge" />
                                <Picker.Item label="Tsunami" value="Tsunami" />
                                <Picker.Item label="Abnormal Sea Behavior" value="Abnormal" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>

                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined" multiline
                            numberOfLines={4} style={styles.input}
                        />

                        {/* Display a preview of the selected image */}
                        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

                        <View style={styles.buttonRow}>
                            <Button icon="image-album" mode="contained" onPress={pickImage} style={styles.button}>
                                Gallery
                            </Button>
                            <Button icon="camera" mode="contained" onPress={takePhoto} style={styles.button}>
                                Camera
                            </Button>
                        </View>

                        {/* Show a loading spinner or the submit button */}
                        {isSubmitting ? (
                            <ActivityIndicator animating={true} color={'navy'} size="large" style={styles.spinner} />
                        ) : (
                            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
                                Submit Report
                            </Button>
                        )}

                        <Button icon="logout" mode="outlined" onPress={handleSignOut} style={styles.signOutButton}>
                            Sign Out
                        </Button>

                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    container: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        elevation: 4,
    },
    input: {
        marginBottom: 16,
    },
    locationText: {
        marginBottom: 16,
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    submitButton: {
        marginTop: 16,
        paddingVertical: 4,
        backgroundColor: 'navy',
    },
    signOutButton: {
        marginTop: 10,
        borderColor: 'navy',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    spinner: {
        marginTop: 16,
    },
    pickerContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
    },
});