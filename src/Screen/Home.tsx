import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchProductDescription,
  flattenJson,
  extractJsonFromMarkdown,
} from '../services/GrokAPI';
import {
  saveAPIKey,
  savePrompt,
  getSavedAPIKey,
  getSavedPrompt,
} from '../services/AsyncStorageAccess';
import { requestPermissions } from '../services/Permission';
import { RenderJsonCards } from '../components/ReponseCard';
import { IconButton } from '../components/IconButton';
import { LoadingScreen } from '../components/LoadingScreent';
import { APIKeyInput } from '../components/APIKeyInput';
import { PromptInput } from '../components/PromptInput';
import { defaultPrompt } from '../data/defaultPrompt';
export const HomeScreen = () => {
  const [description, setDescription] = useState('等待商品描述...');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  // 放大鏡的動畫值
  const translateX = useSharedValue(-50); // 左右移動，範圍縮小
  const scale = useSharedValue(1); // 自動放大縮小
  const rotate = useSharedValue(0); // 旋轉角度（度數）

  //menu
  const [menuVisible, setMenuVisible] = useState(false);

  //API input
  const [APIkeyModalVisible, setAPIkeyModalVisible] = useState(false);
  const [APIkeyinputText, setAPIkeyInputText] = useState('');

  //API key
  const [APIkey, setAPIkey] = useState('');

  // 提示語
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [promptInputText, setPromptInputText] = useState(defaultPrompt);

  const getProductDescription = async (base64Image) => {
    setDescription('正在處理圖片...');
    setJsonData(null);
    const response = await fetchProductDescription(base64Image, APIkey, prompt);
    const extracted = await extractJsonFromMarkdown(response);
    setDescription(extracted);
    try {
      const parsed = JSON.parse(extracted);
      const flattened = flattenJson(parsed);
      setJsonData(flattened);
    } catch (err) {
      console.error('無法解析 JSON：', err);
      setJsonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  //load api key if exist
  useEffect(() => {
    const loadAPIKey = async () => {
      try {
        const savedKey = await getSavedAPIKey();
        if (savedKey) {
          setAPIkeyInputText(savedKey);
          setAPIkey(savedKey);
        }
      } catch (error) {
        console.error('載入 API KEY 失敗', error);
      }
    };

    const loadPrompt = async () => {
      try {
        const savedPrompt = await getSavedPrompt();
        if (savedPrompt) {
          setPrompt(savedPrompt);
          setPromptInputText(savedPrompt);
        } else {
          setPrompt(defaultPrompt);
          setPromptInputText(defaultPrompt);
        }
      } catch (error) {
        console.error('載入 PROMPT 失敗', error);
      }
    };

    loadAPIKey();
    loadPrompt();
  }, []);

  // 自動移動、縮放與旋轉動畫
  useEffect(() => {
    // 移動動畫：從 -50 到 50，來回移動
    translateX.value = withRepeat(
      withTiming(50, {
        duration: 2000,
        easing: Easing.elastic(1), // 使用彈性動畫，讓移動更生動
      }),
      -1, // 無限重複
      true // 反向（來回移動）
    );

    // 縮放動畫：當 translateX 接近 0 時放大，接近兩端時縮小
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 1000, // 縮放動畫與移動同步，每半程（1秒）完成一次放大或縮小
        easing: Easing.elastic(1), // 使用彈性動畫，讓縮放更生動
      }),
      -1, // 無限重複
      true // 反向（來回放大縮小）
    );

    // 旋轉動畫：向右移動時頭部向左傾斜，向左移動時頭部向右傾斜
    rotate.value = withRepeat(
      withTiming(15, {
        duration: 2000,
        easing: Easing.elastic(1), // 使用彈性動畫，讓旋轉更生動
      }),
      -1, // 無限重複
      true // 反向（來回旋轉）
    );
  }, [translateX, scale, rotate]);

  // 放大鏡的動畫樣式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }, // 旋轉動畫
      ],
    };
  });

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = result.assets[0].base64;
      if (!base64Image) {
        Alert.alert('錯誤', '無法處理圖片，請重新拍攝。', [{ text: '確定' }]);
        return;
      }
      setIsLoading(true);
      await getProductDescription(base64Image);
    }
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('權限錯誤', '需要相簿存取權限，請到設定中允許。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      const base64Image = result.assets[0].base64;
      if (!base64Image) {
        Alert.alert('錯誤', '無法處理選取的圖片');
        return;
      }
      setIsLoading(true);
      await getProductDescription(base64Image);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Modal
          transparent
          animationType="fade"
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPressOut={() => setMenuVisible(false)}
          >
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);

                  setAPIkeyModalVisible(true);
                }}
              >
                <Text style={styles.menuItemText}>API Key 設定</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setPromptModalVisible(true);
                }}
              >
                <Text style={styles.menuItemText}>自訂 PROMPT </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  Alert.alert('關於', '目前版本：v1.0');
                }}
              >
                <Text style={styles.menuItemText}>關於此應用</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <PromptInput
        defaultPrompt={defaultPrompt}
        savePrompt={savePrompt}
        prompt={prompt}
        promptInputText={promptInputText}
        promptModalVisible={promptModalVisible}
        setPromptInputText={setPromptInputText}
        setPromptModalVisible={setPromptModalVisible}
      />
      {/* 自訂提示語的 Modal */}

      <APIKeyInput
        APIkeyModalVisible={APIkeyModalVisible}
        setAPIkeyModalVisible={setAPIkeyModalVisible}
        APIkey={APIkey}
        APIkeyinputText={APIkeyinputText}
        setAPIkeyInputText={setAPIkeyInputText}
        saveAPIKey={saveAPIKey}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* 三點按鈕固定在右上角 */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Icon name="ellipsis-v" size={26} color="#000" />
        </TouchableOpacity>

        {/* 放大鏡圖案，固定在螢幕正中 */}
        <View style={styles.magnifyingGlassWrapper}>
          <Animated.View
            style={[styles.magnifyingGlassContainer, animatedStyle]}
          >
            <View style={styles.magnifyingGlass}>
              <View style={styles.glass}>
                <View style={styles.glassInner} />
                <View style={styles.highlight} />
              </View>
            </View>
            <View style={styles.handle} />
          </Animated.View>
        </View>

        {/* 按鈕，放在放大鏡下方 */}
        <IconButton
          iconName={'camera'}
          text={'拍攝商品照片'}
          isLoading={isLoading}
          onPress={takePhoto}
        />

        <IconButton
          iconName={'image'}
          text={'從相簿中選擇'}
          isLoading={isLoading}
          onPress={pickImageFromLibrary}
        />

        <RenderJsonCards jsonData={jsonData} description={description} />
      </ScrollView>
      {/* Loading Spinner */}
      <LoadingScreen isLoading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  magnifyingGlassWrapper: {
    height: 200, // 固定高度以確保放大鏡居中
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  magnifyingGlassContainer: {
    alignItems: 'center',
  },
  magnifyingGlass: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glass: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(173, 216, 230, 0.7)', // 基礎玻璃顏色
    position: 'relative',
  },
  glassInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 模擬漸變層
    opacity: 0.5,
    position: 'absolute',
  },
  highlight: {
    width: 15,
    height: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 白色反光點
    position: 'absolute',
    top: 10,
    left: 10,
  },
  handle: {
    width: 10,
    height: 30,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: -30, // 垂直向下延伸
    right: 35, // 置中對齊放大鏡底部
  },
  button: {
    marginVertical: 20,
    backgroundColor: '#007AFF',
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 5,
  },

  buttonTitle: {
    fontSize: 24,
    color: '#fff',
  },
  description: {
    fontSize: 20,
    textAlign: 'left',
    lineHeight: 32,
    marginTop: 20,
    color: '#000',
  },
  menuButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 10,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 40,
    paddingRight: 15,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 5,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputModal: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    width: '100%',
  },
});
