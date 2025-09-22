// mobile-app/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      console.log('Logged in with:', user.email);
      // Navigation will be handled automatically by the auth state listener
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="waves" size={60} color="#ffffff" />
            </View>
            <Title style={styles.appTitle}>INCOIS</Title>
            <Text style={styles.appSubtitle}>Ocean Hazard Reporting Platform</Text>
          </View>

          {/* Login Card */}
          <Card style={styles.loginCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.loginHeader}>
                <MaterialIcons name="security" size={32} color="#1e3a8a" />
                <Title style={styles.loginTitle}>Welcome Back</Title>
                <Text style={styles.loginSubtitle}>Sign in to continue monitoring ocean hazards</Text>
              </View>

              <Divider style={styles.divider} />

              {/* Email Input */}
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email-outline" />}
                theme={{
                  colors: {
                    primary: '#1e3a8a',
                    outline: '#94a3b8',
                  }
                }}
              />

              {/* Password Input */}
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoComplete="password"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: '#1e3a8a',
                    outline: '#94a3b8',
                  }
                }}
              />

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonText}
                disabled={loading}
                icon={loading ? undefined : "login"}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Forgot Password */}
              <Button
                mode="text"
                onPress={() => {
                  // You can implement forgot password functionality here
                  Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
                }}
                style={styles.forgotButton}
                labelStyle={styles.forgotButtonText}
              >
                Forgot Password?
              </Button>

            </Card.Content>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.signUpButton}
              labelStyle={styles.signUpButtonText}
              icon="account-plus"
            >
              Create Account
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 INCOIS - Indian National Centre for Ocean Information Services
            </Text>
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    fontWeight: '300',
  },
  loginCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 30,
  },
  cardContent: {
    padding: 30,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 10,
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e2e8f0',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#1e3a8a',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    marginTop: 10,
  },
  forgotButtonText: {
    color: '#1e3a8a',
    fontSize: 14,
  },
  signUpSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 15,
  },
  signUpButton: {
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});