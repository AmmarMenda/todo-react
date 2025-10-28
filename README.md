A modern, offline-first to-do list application, built with React Native and Expo.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2052-black.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg)

## 🌟 Features
Create, update, and delete tasks without an internet connection. Changes automatically sync when you're back online using a "latest update wins" strategy

    Multiple Authentication Methods: Sign in with Google OAuth or email/password

    Real-time Sync: Seamless data synchronization with Supabase backend

    Cyberpunk UI: Custom neon-themed interface with glitch text effects

    Secure: Row-level security policies ensure users can only access their own data

    Cross-Platform: Works on both iOS and Android

🛠️ Tech Stack
Frontend

    React Native - Cross-platform mobile framework

    Expo - Development platform and tooling

    Expo Router - File-based routing for React Native

    TypeScript - Type-safe JavaScript

Backend & Services

    Supabase - PostgreSQL database and authentication backend

    Clerk - User authentication and management

    AsyncStorage - Local data persistence for offline functionality

UI/UX

    Expo Blur - Glass-morphism effects

    Custom Theme System - Cyberpunk color palette

    Animated Components - Glitch text effects with React Native Animated API

📋 Prerequisites

Before you begin, ensure you have the following installed:

    Node.js (v18 or higher)

    npm or yarn

    Git

    Expo CLI: npm install -g expo-cli

    Android Studio (for Android) or Xcode (for iOS)

    A Clerk account: Sign up here

    A Supabase account: Sign up here

🚀 Installation
1. Clone the Repository

bash
git clone https://github.com/yourusername/cyberpunk-todo-app.git
cd cyberpunk-todo-app

2. Install Dependencies

bash
npm install

3. Install Required Expo Packages

bash
npx expo install @clerk/clerk-expo @react-native-async-storage/async-storage @react-native-community/netinfo expo-auth-session expo-blur

⚙️ Configuration
Setting Up Clerk
1. Create a Clerk Application

    Go to Clerk Dashboard

    Click "Add application"

    Choose your application name

    Enable Email and Google as authentication providers

2. Configure Authentication Settings

    Navigate to User & Authentication → Email, Phone, Username

    Set Email address to Required

    Set Username to Optional

    Enable Email verification

3. Set Up Google OAuth

    In Clerk Dashboard, go to User & Authentication → Social Connections

    Enable Google

    Follow instructions to create a Google Cloud project

    Add your OAuth credentials to Clerk

4. Create a JWT Template for Supabase

    Go to JWT Templates in Clerk Dashboard

    Click New template and select Supabase

    Add a custom claim:

        Key: user_id

        Value: {{user.id}}

    Save the template

    Copy the Issuer URL (you'll need this for Supabase)

5. Get Your Clerk Publishable Key

    In Clerk Dashboard, go to API Keys

    Copy your Publishable Key

Setting Up Supabase
1. Create a Supabase Project

    Go to Supabase Dashboard

    Click New project

    Fill in project details and create

2. Create the Tasks Table

Go to SQL Editor and run:

sql
-- Create the tasks table
CREATE TABLE public.tasks (
  id BIGSERIAL PRIMARY KEY,
  text TEXT,
  user_id TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create function to extract user ID from JWT
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  );
$$ LANGUAGE sql STABLE;

-- Create RLS policies
CREATE POLICY "Users can insert their own tasks."
ON public.tasks
FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY "Users can view their own tasks."
ON public.tasks
FOR SELECT
USING (requesting_user_id() = user_id);

CREATE POLICY "Users can update their own tasks."
ON public.tasks
FOR UPDATE
USING (requesting_user_id() = user_id)
WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY "Users can delete their own tasks."
ON public.tasks
FOR DELETE
USING (requesting_user_id() = user_id);

3. Configure Supabase for Clerk Authentication

    In Supabase Dashboard, go to Authentication → Providers

    Scroll to JWT (JSON Web Token)

    Paste the Issuer URL from your Clerk JWT template

    Save the configuration

4. Get Your Supabase Credentials

    Go to Settings → API

    Copy your Project URL

    Copy your anon public key

Environment Variables

Create a .env file in the root:

text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

Update app.json

Ensure your app.json has the custom scheme:

json
{
  "expo": {
    "name": "todo-app",
    "slug": "todo-app",
    "scheme": "todoapp",
    "version": "1.0.0",
    "android": {
      "package": "com.yourname.todoapp"
    }
  }
}

🏃 Running the App
Development Mode

bash
# Start the Expo development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Clear cache and restart
npx expo start -c

📦 Building for Production
Using EAS Build (Cloud)

bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --profile production --platform android
