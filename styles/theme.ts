// styles/theme.ts

// --- Palette 1: Cyberpunk Neon ---
const cyberpunk = {
  background: "#0a0f1e",
  primary: "#ff00ff",
  secondary: "#00ffff",
  text: "#e0e0e0",
  placeholder: "#5a678c",
  // Change card to have transparency for the blur effect
  card: "rgba(30, 42, 71, 0.6)", // Darker card background with 60% opacity
  accent: "#f0f000",
};

// --- Palette 2: Clean macOS-inspired ---
const macos = {
  background: "#f6f5fa", // Light gray background
  primary: "#007aff", // Apple's classic blue
  secondary: "#8e8e93", // Medium gray for secondary text
  text: "#1d1d1f", // Near-black text
  placeholder: "#c7c7cd", // Light gray for placeholders
  card: "#ffffff", // White card background
  accent: "#ff3b30", // Red accent for dismiss buttons
};

// --- Select your theme here ---
export const colors = cyberpunk; // or macos

export const typography = {
  fontSize: {
    title: 24,
    subtitle: 18,
    body: 16,
  },
  fontWeight: {
    bold: "700" as "700",
    regular: "400" as "400",
  },
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};
