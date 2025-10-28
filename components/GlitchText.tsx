// components/GlitchText.tsx

import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View } from "react-native";
import { colors, typography } from "../styles/theme";

export default function GlitchText({ text }: { text: string }) {
  const glitchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glitchLoop = Animated.loop(
      Animated.sequence([
        // Short bursts of movement
        Animated.timing(glitchAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        // Pause for a random duration to make it feel more erratic
        Animated.delay(Math.random() * 800 + 200),
      ]),
    );

    glitchLoop.start();
    // Cleanup the animation on component unmount
    return () => glitchLoop.stop();
  }, [glitchAnim]);

  // Interpolate the animated value to create horizontal displacement
  const translateXRed = glitchAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2, 2],
  });
  const translateXBlue = glitchAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [2, -2],
  });

  return (
    <View>
      {/* Base text layer (white) */}
      <Animated.Text style={styles.text}>{text}</Animated.Text>

      {/* Glitch layer 1 (primary color) */}
      <Animated.Text
        style={[
          styles.text,
          styles.glitchLayer,
          { color: colors.primary, transform: [{ translateX: translateXRed }] },
        ]}
      >
        {text}
      </Animated.Text>

      {/* Glitch layer 2 (secondary color) */}
      <Animated.Text
        style={[
          styles.text,
          styles.glitchLayer,
          {
            color: colors.secondary,
            transform: [{ translateX: translateXBlue }],
          },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  glitchLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.7, // Make glitch layers semi-transparent
  },
});
