import { Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert(
        '權限錯誤',
        '需要相機權限，請到手機設置中開啟相機權限，然後重新嘗試。',
        [{ text: '確定' }],
        { cancelable: true }
      );
      return false;
    }
    return true;
  };
  