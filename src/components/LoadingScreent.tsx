import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingScreen = ({ isLoading }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
  },
});
