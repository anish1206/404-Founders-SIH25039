// mobile-app/screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      console.log('Registered with:', user.email);
      Alert.alert(
        'Account Created!', 
        'Your account has been created successfully. You can now report ocean hazards.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
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
            <Title style={styles.appTitle}>Join INCOIS</Title>
            <Text style={styles.appSubtitle}>Create an account to start reporting ocean hazards</Text>
          </View>

          {/* Sign Up Card */}
          <Card style={styles.signUpCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.signUpHeader}>
                <MaterialIcons name="person-add" size={32} color="#1e3a8a" />
                <Title style={styles.signUpTitle}>Create Account</Title>
                <Text style={styles.signUpSubtitle}>Join our community of ocean safety monitors</Text>
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

              {/* Confirm Password Input */}
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: '#1e3a8a',
                    outline: '#94a3b8',
                  }
                }}
              />

              {/* Password Requirements */}
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsText}>Password must be at least 6 characters long</Text>
              </View>

              {/* Sign Up Button */}
              <Button
                mode="contained"
                onPress={handleSignUp}
                style={styles.signUpButton}
                contentStyle={styles.signUpButtonContent}
                labelStyle={styles.signUpButtonText}
                disabled={loading}
                icon={loading ? undefined : "account-plus"}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  'Create Account'
                )}
              </Button>

            </Card.Content>
          </Card>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              icon="login"
            >
              Sign In
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to help monitor ocean safety{'\n'}
              and report hazardous conditions responsibly.
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
  signUpCard: {
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
  signUpHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 10,
    marginBottom: 5,
  },
  signUpSubtitle: {
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
  passwordRequirements: {
    marginBottom: 20,
  },
  requirementsText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  signUpButton: {
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
  signUpButtonContent: {
    paddingVertical: 8,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  loginButtonText: {
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