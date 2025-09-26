// /mobile-app/screens/HomeScreen.js
import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Appbar, Text } from 'react-native-paper';
import { auth } from '../firebase';

const HomeScreen = ({ navigation }) => {
  const user = auth.currentUser;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => auth.signOut()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Ocean Hazard Platform" />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>Welcome Back!</Title>
            <Paragraph style={styles.welcomeText}>
              Hello {user?.email || 'User'}, ready to help keep our oceans safe?
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            
            <Button
              icon="alert-circle"
              mode="contained"
              onPress={() => navigation.navigate('ReportTab')}
              style={[styles.actionButton, styles.reportButton]}
              contentStyle={styles.buttonContent}
            >
              Report Ocean Hazard
            </Button>
            
            <Button
              icon="shield-check"
              mode="contained-tonal"
              onPress={() => navigation.navigate('SchemesTab')}
              style={[styles.actionButton, styles.schemeButton]}
              contentStyle={styles.buttonContent}
            >
              Government Support Schemes
            </Button>
            
            <Button
              icon="account-circle"
              mode="outlined"
              onPress={() => navigation.navigate('ProfileTab')}
              style={[styles.actionButton, styles.profileButton]}
              contentStyle={styles.buttonContent}
            >
              View Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About This Platform</Title>
            <Paragraph style={styles.infoText}>
              This platform helps coastal communities report ocean hazards and access government support schemes. Your reports help authorities respond quickly to potential dangers.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>System Status</Title>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Platform Status:</Text>
                <Text style={styles.statusValue}>🟢 Online</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Last Updated:</Text>
                <Text style={styles.statusValue}>Just now</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#1976d2',
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  reportButton: {
    backgroundColor: '#d32f2f',
  },
  schemeButton: {
    backgroundColor: '#1976d2',
  },
  profileButton: {
    borderColor: '#666',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;