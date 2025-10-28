// app/(tabs)/_layout.tsx

import React from "react";
// Change this import from 'expo-router' to 'expo-router/stack'
import { Stack } from "expo-router/stack";
import { SignedIn } from "@clerk/clerk-expo";
import TopBar from "../../components/TopBar";
import { View, StyleSheet } from "react-native";

export default function AppLayout() {
  return (
    <SignedIn>
      <View style={{ flex: 1 }}>
        {/* Use a Stack navigator instead of Tabs */}
        <Stack
          screenOptions={{
            // This ensures no default header is shown
            headerShown: false,
          }}
        />

        {/* Your custom TopBar remains the same */}
        <View style={styles.topBarContainer}>
          <TopBar />
        </View>
      </View>
    </SignedIn>
  );
}

const styles = StyleSheet.create({
  topBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
