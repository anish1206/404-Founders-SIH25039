// /mobile-app/screens/SchemesScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, ActivityIndicator, Text } from 'react-native-paper';
import axios from 'axios';

const SchemesScreen = ({ navigation }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const apiEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/schemes`;
        const response = await axios.get(apiEndpoint);
        setSchemes(response.data);
      } catch (err) {
        console.error('Error fetching schemes:', err);
        setError('Failed to load schemes. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const handleLinkPress = async (url) => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
          await Linking.openURL(url);
      } else {
          Alert.alert(`Don't know how to open this URL: ${url}`);
      }
  };

  return (
    <View style={styles.flexContainer}>
      <Appbar.Header>
        <Appbar.Content title="Government Schemes" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        {loading && <ActivityIndicator animating={true} size="large" style={{ marginTop: 20 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && schemes.length === 0 && (
          <Text style={styles.errorText}>No government schemes available at this time.</Text>
        )}
        {schemes.map(scheme => (
          <Card key={scheme._id} style={styles.card}>
            <Card.Content>
              <Title>{scheme.title}</Title>
              <Paragraph style={styles.category}>Category: {scheme.category}</Paragraph>
              <Paragraph>{scheme.description}</Paragraph>
              <Paragraph style={styles.eligibility}>Eligibility: {scheme.eligibility}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleLinkPress(scheme.officialLink)}>
                Visit Official Site
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  eligibility: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default SchemesScreen;