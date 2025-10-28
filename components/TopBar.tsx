import { useClerk, useUser } from "@clerk/clerk-expo";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { colors } from "../styles/theme";
import GlitchText from "./GlitchText";

export default function TopBar() {
  const { signOut } = useClerk();
  const { user } = useUser();

  if (!user) {
    return <BlurView intensity={80} tint="dark" style={styles.container} />;
  }

  const displayName =
    user.username ||
    user.firstName ||
    user.emailAddresses[0]?.emailAddress.split("@")[0] ||
    "User";

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <GlitchText text={`Welcome, ${displayName}`} />

      <TouchableOpacity onPress={() => signOut()} style={styles.logoutButton}>
        <Feather name="log-out" size={24} color={colors.primary} />
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    height: 90,
    width: "100%",
    paddingHorizontal: 16,
  },
  logoutButton: {
    padding: 8,
  },
});
