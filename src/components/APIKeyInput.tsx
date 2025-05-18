import {
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

export const APIKeyInput = ({
  APIkey,
  APIkeyModalVisible,
  setAPIkeyModalVisible,
  APIkeyinputText,
  setAPIkeyInputText,
  saveAPIKey,
}) => {
  return (
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
              multiline={true} // ✅ 禁用多行（讓它單行捲動）
              scrollEnabled={true} // ✅ 允許左右捲動
              textAlignVertical="center" // ✅ 垂直置中（可選）
              numberOfLines={10} // ✅ 固定單行
              selectTextOnFocus={true} // ✅ 點擊時選中全部（可選 UX）
              autoCapitalize="none" // ✅ 不自動大寫
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 10 }]}
                onPress={() => {
                  setAPIkeyInputText(APIkey);
                  setAPIkeyModalVisible(false);
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
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
});
