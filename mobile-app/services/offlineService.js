// /mobile-app/services/offlineService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = 'offline_report_queue';

// Get all reports currently saved in the offline queue
export const getOfflineQueue = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch offline queue.", e);
    return [];
  }
};

// Add a new report to the offline queue
export const addToOfflineQueue = async (reportData) => {
  try {
    const currentQueue = await getOfflineQueue();
    currentQueue.push({ ...reportData, id: `offline_${Date.now()}` }); // Give it a temporary ID
    const jsonValue = JSON.stringify(currentQueue);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, jsonValue);
    console.log("Report added to offline queue.");
  } catch (e) {
    console.error("Failed to add to offline queue.", e);
  }
};

// Clear the entire offline queue (after a successful sync)
export const clearOfflineQueue = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    console.log("Offline queue cleared.");
  } catch (e) {
    console.error("Failed to clear offline queue.", e);
  }
};