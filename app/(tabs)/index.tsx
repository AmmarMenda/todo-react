// app/(tabs)/index.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { getSupabaseClient } from "../../lib/supabase";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { colors, spacing, typography } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import GlitchText from "../../components/GlitchText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";

interface Task {
  id: number;
  text: string | null;
  is_complete: boolean;
  is_deleted?: boolean;
  created_at: string;
  user_id: string;
  updated_at: string;
}

const TASKS_STORAGE_KEY = "@todo_tasks";

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadTasksFromCache();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncTasks();
      }
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        syncTasks();
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribeNetInfo();
      subscription.remove();
    };
  }, [user]);

  const loadTasksFromCache = async () => {
    try {
      const cachedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (cachedTasks !== null) {
        setTasks(JSON.parse(cachedTasks));
      } else {
        syncTasks(); // Fetch from server if cache is empty
      }
    } catch (e) {
      console.error("Failed to load tasks from cache.", e);
    }
  };

  const saveTasksToCache = async (newTasks: Task[]) => {
    try {
      const sortedTasks = newTasks.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setTasks(sortedTasks);
      await AsyncStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(sortedTasks),
      );
    } catch (e) {
      console.error("Failed to save tasks to cache.", e);
    }
  };

  const addTask = async () => {
    if (task.trim() === "" || !user) return;
    Keyboard.dismiss();

    const tempId = Date.now();
    const newTask: Task = {
      id: tempId,
      text: task,
      user_id: user.id,
      is_complete: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newTasks = [newTask, ...tasks];
    saveTasksToCache(newTasks);
    setTask("");

    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) return;

    const supabase = await getSupabaseClient(getToken);
    if (!supabase) return;

    const { id, ...insertableTask } = newTask; // Exclude temp id
    const { data: insertedData, error } = await supabase
      .from("tasks")
      .insert(insertableTask)
      .select()
      .single();

    if (!error) {
      const finalTasks = newTasks.map((t) =>
        t.id === tempId ? insertedData : t,
      );
      saveTasksToCache(finalTasks);
    }
  };

  // --- THIS IS THE CORRECTED FUNCTION ---
  const syncTasks = async () => {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected || !user) return;

    const supabase = await getSupabaseClient(getToken);
    if (!supabase) return;

    // Get a fresh copy of local tasks from storage, not state
    const cachedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const localTasks: Task[] = cachedTasks ? JSON.parse(cachedTasks) : [];

    // Fetch remote tasks
    const { data: remoteTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*");
    if (fetchError) {
      console.error("Sync Error: Could not fetch from server", fetchError);
      return;
    }

    const tasksToUpdate: Task[] = [];
    const tasksToInsert: Omit<Task, "id">[] = [];

    localTasks.forEach((localTask) => {
      const remoteTask = remoteTasks.find((rt) => rt.id === localTask.id);
      if (!remoteTask) {
        const { id, ...insertableTask } = localTask;
        tasksToInsert.push(insertableTask);
      } else if (
        new Date(localTask.updated_at) > new Date(remoteTask.updated_at)
      ) {
        tasksToUpdate.push(localTask);
      }
    });

    if (tasksToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update(tasksToUpdate)
        .in(
          "id",
          tasksToUpdate.map((t) => t.id),
        );
      if (updateError)
        console.error("Sync Error: Could not push updates", updateError);
    }
    if (tasksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("tasks")
        .insert(tasksToInsert);
      if (insertError)
        console.error("Sync Error: Could not push inserts", insertError);
    }

    // Final sync to get the definitive state from the server
    const { data: finalTasks, error: finalFetchError } = await supabase
      .from("tasks")
      .select("*");
    if (!finalFetchError) {
      saveTasksToCache(finalTasks);
    }

    console.log("Sync complete.");
  };

  const toggleDone = async (id: number) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            is_complete: !t.is_complete,
            updated_at: new Date().toISOString(),
          }
        : t,
    );
    saveTasksToCache(updatedTasks);
    syncTasks();
  };

  const dismissTask = async (id: number) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id
        ? { ...t, is_deleted: true, updated_at: new Date().toISOString() }
        : t,
    );
    saveTasksToCache(updatedTasks);
    syncTasks();
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity
        onPress={() => toggleDone(item.id)}
        style={styles.taskTextContainer}
      >
        {item.is_complete ? (
          <View style={styles.glitchStrikeWrapper}>
            <GlitchText text={item.text || ""} />
            <View style={styles.strikeThroughLine} />
          </View>
        ) : (
          <Text style={styles.taskText}>{item.text}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => dismissTask(item.id)}>
        <Feather name="trash-2" size={24} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>Your To-Do List</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <Text style={styles.addButtonText}>ADD TASK</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks.filter((t) => !t.is_deleted)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks yet. Add one to get started!
          </Text>
        }
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.large,
    paddingTop: 100,
  },
  subtitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.large,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: spacing.large,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: spacing.small,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.medium,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: typography.fontSize.body,
  },
  addButton: {
    height: 50,
    borderRadius: spacing.small,
    overflow: "hidden",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.medium,
    borderRadius: spacing.small,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: typography.fontSize.subtitle,
    color: colors.text,
  },
  glitchStrikeWrapper: {
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  strikeThroughLine: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.secondary,
    width: "100%",
    opacity: 0.8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: typography.fontSize.body,
    color: colors.placeholder,
  },
});
