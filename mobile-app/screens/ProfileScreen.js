// /mobile-app/screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Appbar, Text, Avatar, Divider } from 'react-native-paper';
import { auth } from '../firebase';

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [userStats] = useState({
    reportsSubmitted: 12,
    schemesViewed: 8,
    lastLogin: new Date().toLocaleDateString(),
  });

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

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing feature will be available in the next update.');
  };

  const handleViewReports = () => {
    Alert.alert('Coming Soon', 'View your reports history feature will be available soon.');
  };

  const handleSettings = () => {
    Alert.alert('Coming Soon', 'Settings feature will be available in the next update.');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="cog" onPress={handleSettings} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Icon 
                size={80} 
                icon="account" 
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Title style={styles.userName}>{user?.email || 'User'}</Title>
                <Paragraph style={styles.userRole}>Community Reporter</Paragraph>
                <Paragraph style={styles.memberSince}>
                  Member since: {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                    'Recently'}
                </Paragraph>
              </View>
            </View>
            
            <Button 
              mode="outlined" 
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Your Activity</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.reportsSubmitted}</Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.schemesViewed}</Text>
                <Text style={styles.statLabel}>Schemes Viewed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account Information</Title>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status:</Text>
              <Text style={[styles.infoValue, styles.activeStatus]}>Active</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login:</Text>
              <Text style={styles.infoValue}>{userStats.lastLogin}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{user?.uid?.substring(0, 8) || 'N/A'}...</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            
            <Button
              icon="file-document-multiple"
              mode="outlined"
              onPress={handleViewReports}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              View My Reports
            </Button>
            
            <Button
              icon="shield-check"
              mode="outlined"
              onPress={() => navigation.navigate('SchemesTab')}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              Browse Government Schemes
            </Button>
            
            <Button
              icon="help-circle"
              mode="outlined"
              onPress={() => Alert.alert('Help', 'Contact support at support@oceanplatform.gov')}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              Get Help & Support
            </Button>
          </Card.Content>
        </Card>

        {/* Sign Out */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              icon="logout"
              mode="contained"
              onPress={handleSignOut}
              style={styles.signOutButton}
              contentStyle={styles.buttonContent}
            >
              Sign Out
            </Button>
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
  profileCard: {
    marginBottom: 16,
    elevation: 4,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#888',
  },
  editButton: {
    borderColor: '#1976d2',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  activeStatus: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#eee',
  },
  actionButton: {
    marginBottom: 12,
    borderColor: '#666',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  signOutButton: {
    backgroundColor: '#d32f2f',
  },
});

export default ProfileScreen;