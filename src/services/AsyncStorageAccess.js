import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const saveAPIKey = async (APIkeyinputText) => {
  try {
    await AsyncStorage.setItem('API_KEY', APIkeyinputText);
    Alert.alert('已儲存', 'API Key 已儲存成功');
  } catch (error) {
    Alert.alert('儲存失敗', '無法儲存 API Key');
    console.error('儲存失敗:', error);
  }
}

export const savePrompt = async (promptInputText) => {
  try {
    await AsyncStorage.setItem('PROMPT', promptInputText);

    Alert.alert('已儲存', 'PROMPT 已儲存成功');
  } catch (error) {
    Alert.alert('儲存失敗', '無法儲存 PROMPT');
    console.error('儲存失敗:', error);
  }

}


export const getSavedAPIKey = async () => {
  try {
    const savedKey = await AsyncStorage.getItem('API_KEY');
    return savedKey
  } catch (error) {

    console.error('載入 API KEY 失敗: ', error);
  }
}

export const getSavedPrompt = async () => {
  try {
    const savedPrompt = await AsyncStorage.getItem('PROMPT');
    return savedPrompt
  } catch (error) {

    console.error('載入 API KEY 失敗: ', error);
  }
}