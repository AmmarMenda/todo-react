// app/_layout.tsx

import React, { useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import {
  Slot,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { ActivityIndicator, View } from "react-native";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function InitialLayout() {
  const { isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // This hook will return `null` until the navigation state is ready.
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for both Clerk and the router to be ready.
    if (!isLoaded || !navigationState?.key) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    // Perform the redirects based on auth state
    if (!userId && !inAuthGroup) {
      router.replace("/login");
    } else if (userId && inAuthGroup) {
      router.replace("/");
    }
  }, [isLoaded, userId, segments, navigationState, router]); // Add navigationState to dependencies

  // Show a loading screen while we wait for everything to load.
  if (!isLoaded || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}
