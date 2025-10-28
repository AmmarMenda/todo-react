// app/sign-up.tsx

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
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { colors, spacing, typography } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";

// Create the redirect URL using your custom scheme
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: "todoapp", // Must match the scheme in your app.json
});

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Pass the explicit redirectUrl to the useOAuth hook
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl: redirectUrl,
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        username: username,
        password: password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const errorMessages = err.errors
        .map((error: any) => error.longMessage)
        .join("\n\n");
      Alert.alert(
        "Sign-Up Failed",
        errorMessages || "An unknown error occurred.",
      );
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onGoogleSignUpPress = async () => {
    try {
      const { createdSessionId, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        // If this is a new sign-up via Google, auto-populate username from email
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
        "Could not sign up with Google. Please try again.",
      );
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      Alert.alert(
        "Verification Error",
        err.errors ? err.errors[0].longMessage : "Invalid code.",
      );
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {!pendingVerification ? (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onGoogleSignUpPress}
          >
            <Feather name="google" size={24} color={colors.text} />
            <Text style={styles.socialButtonText}>Sign up with Google</Text>
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
            autoCapitalize="none"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
          <Button
            title="Create Account"
            onPress={onSignUpPress}
            color={colors.primary}
          />

          <Link href="/login" asChild>
            <Text style={styles.linkText}>
              Already have an account? Sign In
            </Text>
          </Link>
        </>
      ) : (
        <>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.instructions}>
            Enter the code sent to your email address.
          </Text>
          <TextInput
            value={code}
            placeholder="Verification Code..."
            onChangeText={setCode}
            style={styles.input}
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
          />
          <Button
            title="Verify Code"
            onPress={onPressVerify}
            color={colors.primary}
          />
        </>
      )}
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
  instructions: {
    fontSize: typography.fontSize.body,
    color: colors.placeholder,
    textAlign: "center",
    marginBottom: spacing.medium,
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
