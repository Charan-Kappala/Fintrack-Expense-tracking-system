import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOAuth } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { isLoading } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [isSigningIn, setIsSigningIn] = useState(false);

  const onPress = React.useCallback(async () => {
    console.log('🚀 Starting Google OAuth flow...');
    setIsSigningIn(true);
    
    try {
      const { createdSessionId, setActive, authSessionResult } = await startOAuthFlow();
      console.log('📱 OAuth result:', { createdSessionId, authSessionResult });

      if (createdSessionId && setActive) {
        console.log('✅ Setting active session:', createdSessionId);
        await setActive({ session: createdSessionId });
      } else {
        console.log('❌ No session created or setActive unavailable');
        if (authSessionResult?.type === 'cancel') {
          console.log('👤 User cancelled OAuth flow');
        }
      }
    } catch (err) {
      console.error('❌ OAuth error:', err);
      Alert.alert(
        'Sign In Error',
        err instanceof Error ? err.message : 'An error occurred during sign in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [startOAuthFlow]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.logoBackground}
            >
              <Ionicons name="wallet" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>FinTrack Lite</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#dbeafe', '#e0e7ff']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.logoBackground}
          >
            <Ionicons name="wallet" size={32} color="white" />
          </LinearGradient>
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>FinTrack Lite</Text>
        <Text style={styles.subtitle}>
          Sign in to track your expenses and manage your budget.
        </Text>

        {/* Sign In Button */}
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.8}
          disabled={isSigningIn}
          style={{ opacity: isSigningIn ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.signInButton}
          >
            {isSigningIn ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[styles.signInButtonText, { marginLeft: 8 }]}>Signing In...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="logo-google" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.signInButtonText}>Sign In with Google</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInContainer: {
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Auth;