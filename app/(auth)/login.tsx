// app/sign-in.tsx

import {
  Button,
  TextInput,
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { colors, spacing, typography } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";

// Create the redirect URL using your custom scheme
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: "todoapp", // Must match the scheme in your app.json
});

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Pass the explicit redirectUrl to the useOAuth hook
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl: redirectUrl,
  });

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/");
    } catch (err: any) {
      Alert.alert(
        "Sign-In Error",
        err.errors ? err.errors[0].longMessage : "Invalid credentials.",
      );
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onGoogleSignInPress = async () => {
    try {
      const { createdSessionId, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        // If this is a new sign-up via Google, auto-populate username
        if (signUp && signUp.emailAddress && !signUp.username) {
          const emailUsername = signUp.emailAddress.split("@")[0];
          try {
            await signUp.update({ username: emailUsername });
          } catch (updateErr) {
            console.log("Could not auto-set username:", updateErr);
          }
        }

        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("OAuth error", err);
      Alert.alert(
        "OAuth Error",
        "Could not sign in with Google. Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={onGoogleSignInPress}
      >
        <Feather name="google" size={24} color={colors.text} />
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <Text style={styles.separator}>or</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />
      <Button title="Sign In" onPress={onSignInPress} color={colors.primary} />

      <Link href="/signup" asChild>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.large,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: spacing.small,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: typography.fontSize.body,
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.medium,
    fontSize: typography.fontSize.body,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    padding: spacing.medium,
    borderRadius: spacing.small,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  socialButtonText: {
    color: colors.text,
    marginLeft: spacing.medium,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
  },
  separator: {
    color: colors.placeholder,
    textAlign: "center",
    marginVertical: spacing.medium,
  },
});
