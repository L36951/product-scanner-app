import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ScrollView, ActivityIndicator, Modal, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';


const defaultPrompt = `
我是一位老人，我想知道這個商品的內容，你是一位超級助理，請幫我翻譯圖片中的商品內容，抓取商品的重點訊息，並以標準 JSON 格式，不要用markdown 格式。
我只會看繁體中文，請把商品內容翻譯做繁體中文。
請只提供商品的內容，不要提供對於老人不必要的內容。
請根據圖片內容填寫，不要填寫圖片沒有的內容，並且不要有任何額外的文字或說明。
`

const HomeScreen = () => {
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

  // API KEY
  const [APIkey, setAPIkey] = useState('');

  // 提示語
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [promptInputText, setPromptInputText] = useState(defaultPrompt);

  //load api key if exist
  useEffect(() => {
    const loadAPIKey = async () => {
      try {
        const savedKey = await AsyncStorage.getItem('API_KEY');
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
        const savedPrompt = await AsyncStorage.getItem('PROMPT');
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

  const saveAPIKey = async () => {
    try {
      await AsyncStorage.setItem('API_KEY', APIkeyinputText);
      setAPIkey(APIkeyinputText);
      Alert.alert('已儲存', 'API Key 已儲存成功');
    } catch (error) {
      Alert.alert('儲存失敗', '無法儲存 API Key');
      console.error('儲存失敗:', error);
    }
    setAPIkeyModalVisible(false);
  }

  const savePrompt = async () => {
    try {
      await AsyncStorage.setItem('PROMPT', promptInputText);
      setPrompt(promptInputText);
      Alert.alert('已儲存', 'PROMPT 已儲存成功');
    } catch (error) {
      Alert.alert('儲存失敗', '無法儲存 PROMPT');
      console.error('儲存失敗:', error);
    }
    setPromptModalVisible(false);
  }

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

  const requestPermissions = async () => {
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
      await fetchProductDescription(base64Image);
    }
  };
  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('權限錯誤', '需要相簿存取權限，請到設定中允許。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.5, base64: true });
    if (!result.canceled) {
      const base64Image = result.assets[0].base64;
      if (!base64Image) {
        Alert.alert('錯誤', '無法處理選取的圖片');
        return;
      }
      setIsLoading(true);
      await fetchProductDescription(base64Image);
    }
  };
  const fetchProductDescription = async (base64Image) => {
    try {
      setDescription('正在處理圖片...');
      setJsonData(null);
      console.log('Sending request to Grok API...');
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-2-vision-1212',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: 'Bearer ' + APIkey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      console.log('Grok API response:', response.data);
      const description = response.data.choices[0].message.content;
      const extracted = extractJsonFromMarkdown(description);
      console.log('Setting description:', extracted);
      setDescription(extracted);
      try {
        const parsed = JSON.parse(extracted);
        const flattened = flattenJson(parsed);
        setJsonData(flattened);
      } catch (err) {
        console.error('無法解析 JSON：', err);
        setJsonData(null);
      }
    } catch (error) {
      console.error('Grok API request failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('錯誤', '網絡有問題，請檢查網絡後重試。', [{ text: '確定' }]);
      } else {
        console.error('Error message:', error.message);
        Alert.alert('錯誤', '無法處理圖片，請稍後再試。', [{ text: '確定' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonCards = () => {
    if (!jsonData) return <Text style={styles.description}>{description}</Text>;
    return Object.entries(jsonData).map(([key, value]) => (
      <View key={key} style={styles.cardBox}>
        <Text style={styles.cardTitle}>{key}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    ));
  };
  const extractJsonFromMarkdown = (text) => {
    const match = text.match(/```json\s*({[\s\S]*?})\s*```/);
    return match ? match[1] : text;
  };
  const flattenJson = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj;
    const flat = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          flat[subKey] = subValue;
        }
      } else {
        flat[key] = value;
      }
    }
    return flat;
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
      {/* 自訂提示語的 Modal */}
      <View>
        <Modal visible={promptModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.inputModal}>
              <Text style={styles.modalTitle}>請輸入文字：</Text>
              <TextInput
                style={styles.textInput}
                placeholder="輸入內容"
                value={promptInputText}
                onChangeText={setPromptInputText}
                multiline={true}              // ✅ 禁用多行（讓它單行捲動）
                scrollEnabled={true}          // ✅ 允許左右捲動
                textAlignVertical="center"    // ✅ 垂直置中（可選）
                numberOfLines={10}             // ✅ 固定單行
                selectTextOnFocus={true}      // ✅ 點擊時選中全部（可選 UX）
                autoCapitalize="none"         // ✅ 不自動大寫
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginRight: 10 }]}
                  onPress={() => {
                    setPromptInputText(prompt);
                    setPromptModalVisible(false)
                  }}
                >
                  <Text style={styles.buttonTitle}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginRight: 10 }]}
                  onPress={() => {
                    setPromptInputText(defaultPrompt);

                  }}
                >
                  <Text style={styles.buttonTitle}>回復預設</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={savePrompt}
                >
                  <Text style={styles.buttonTitle}>儲存</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* 自訂 API_KEY的 Modal */}
      <View>
        <Modal visible={APIkeyModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.inputModal}>
              <Text style={styles.modalTitle}>請輸入文字：</Text>
              <TextInput
                style={styles.textInput}
                placeholder="輸入內容"
                value={APIkeyinputText}
                onChangeText={setAPIkeyInputText}
                multiline={true}              // ✅ 禁用多行（讓它單行捲動）
                scrollEnabled={true}          // ✅ 允許左右捲動
                textAlignVertical="center"    // ✅ 垂直置中（可選）
                numberOfLines={10}             // ✅ 固定單行
                selectTextOnFocus={true}      // ✅ 點擊時選中全部（可選 UX）
                autoCapitalize="none"         // ✅ 不自動大寫
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginRight: 10 }]}
                  onPress={() => {
                    setAPIkeyInputText(APIkey);
                    setAPIkeyModalVisible(false)
                  }}
                >
                  <Text style={styles.buttonTitle}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={saveAPIKey}
                >
                  <Text style={styles.buttonTitle}>儲存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Loading Spinner */}
      {
        isLoading && (
          <View>
            <Modal transparent={true} animationType="fade" visible={isLoading}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>正在處理，請稍候...</Text>
              </View>
            </Modal>
          </View>
        )
      }

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
          <Animated.View style={[styles.magnifyingGlassContainer, animatedStyle]}>
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
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled, styles.takePhotoButton]}
          onPress={takePhoto}
          disabled={isLoading}
        >
          <Icon name="camera" size={30} color="#fff" style={[styles.buttonIcon]} />
          <Text style={styles.buttonTitle}>拍攝商品照片</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromLibrary}>
          <Icon name="image" size={30} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonTitle}>從相簿選擇照片</Text>
        </TouchableOpacity>
        {/* 描述文字 
        <Text style={styles.description}>{description}</Text>
*/}
        {renderJsonCards()}
      </ScrollView>

    </SafeAreaView >
  );
};

const App = () => {
  return (

    <HomeScreen />
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
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  buttonIcon: {
    marginRight: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    color: '#fff',
  }, menuButton: {
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
  cardBox: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  cardValue: {
    fontSize: 24,
    color: '#444',
  },
  takePhotoButton: {
    backgroundColor: 'rgb(4, 199, 37)',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default App;