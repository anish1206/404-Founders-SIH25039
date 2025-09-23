// /mobile-app/App.js
import React, { useState, useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HazardReportScreen from './screens/HazardReportScreen';

// --- OFFLINE TOOLS IMPORTS ---
import { useNetInfo } from '@react-native-community/netinfo';
import { getOfflineQueue, clearOfflineQueue } from './services/offlineService';
import axios from 'axios';

const Stack = createNativeStackNavigator();

// --- Reusable Submission Logic ---
const submitReportToServer = async (report) => {
    const formData = new FormData();
    formData.append('file', {
      uri: report.imageUri, type: `image/${report.imageUri.split('.').pop()}`, name: `upload.${report.imageUri.split('.').pop()}`
    });
    formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const cloudinaryRes = await axios.post(cloudinaryUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const mediaUrl = cloudinaryRes.data.secure_url;

    const finalReportData = { ...report, mediaUrl };
    delete finalReportData.imageUri;

    const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/reports`;
    await axios.post(apiEndpoint, finalReportData);
};


export default function App() {
  const [user, setUser] = useState(null);
  const netInfo = useNetInfo();

  // --- MODIFIED AUTOMATIC SYNC EFFECT ---
  useEffect(() => {
    // This function contains the sync logic
    const syncOfflineQueue = async () => {
      console.log("Connection detected. Checking for offline reports to sync...");
      const queue = await getOfflineQueue();
      if (queue.length > 0) {
        console.log(`Syncing ${queue.length} offline reports...`);
        for (const report of queue) {
          try {
            await submitReportToServer(report);
          } catch (error) {
            // Log the detailed error but stop the process
            console.error("Failed to sync a report, will try again later.", error.message);
            // We return here to stop the loop. We'll try again on the next connection change.
            return;
          }
        }
        await clearOfflineQueue();
        console.log("Offline queue synced and cleared successfully!");
      } else {
        console.log("Offline queue is empty. Nothing to sync.");
      }
    };

    // We only run the sync if the connection status changes to 'true'
    if (netInfo.isConnected === true) {
      // Add a 5-second delay to give the server (on the hotspot) time to be ready
      console.log("Device is online. Waiting 5 seconds before syncing...");
      const timer = setTimeout(() => {
        syncOfflineQueue();
      }, 5000); // 5-second grace period

      // Cleanup function to cancel the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [netInfo.isConnected]); // This effect still runs when connection status changes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <Stack.Screen name="HazardReport" component={HazardReportScreen} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}