import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
export const RenderJsonCards = ({ jsonData, description }) => {
  if (!jsonData) return <Text style={styles.description}>{description}</Text>;
  return (
    Object.entries(jsonData).map(([key, value]) => (
      <View key={key} style={styles.cardBox}>
        <Text style={styles.cardTitle}>{key}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    ))

  )
};

const styles = StyleSheet.create({
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
});
