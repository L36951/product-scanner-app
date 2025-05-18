import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
export const IconButton = ({ iconName, onPress, isLoading, text }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isLoading && styles.buttonDisabled,
        styles.takePhotoButton,
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Icon
        name={iconName}
        size={30}
        color="#fff"
        style={[styles.buttonIcon]}
      />
      <Text style={styles.buttonTitle}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  takePhotoButton: {
    backgroundColor: 'rgb(4, 199, 37)',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});
