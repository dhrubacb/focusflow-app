import { FlatList, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks } from "@/contexts/task-context";
import { useState, useMemo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { router } from "expo-router";

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

export default function TasksScreen() {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const colors = useColors();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filter
    switch (filter) {
      case 'today':
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          return task.dueDate.split('T')[0] === today;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(task => {
          if (!task.dueDate || task.completed) return false;
          return task.dueDate.split('T')[0] >= today;
        });
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: incomplete first, then by due date
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });
  }, [tasks, filter, searchQuery, today]);

  const handleToggleTask = (taskId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTask(taskId);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${taskTitle}"?`)) {
        deleteTask(taskId);
      }
    } else {
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete "${taskTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTask(taskId),
          },
        ]
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground">Tasks</Text>
            <TouchableOpacity
              onPress={() => router.push('/task-edit')}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="bg-surface rounded-xl px-4 py-3 border border-border mb-4">
            <TextInput
              placeholder="Search tasks..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-base text-foreground"
            />
          </View>

          {/* Filter Tabs */}
          <View className="flex-row gap-2">
            {(['all', 'today', 'upcoming', 'completed'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full ${
                  filter === f ? 'bg-primary' : 'bg-surface border border-border'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === f ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="bg-surface rounded-2xl p-8 border border-border items-center mt-4">
              <Text className="text-muted text-center text-base">
                {searchQuery ? 'No tasks found' : 'No tasks yet'}
              </Text>
              <Text className="text-muted text-center text-sm mt-2">
                {!searchQuery && 'Tap + to create your first task'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3">
              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-start gap-3">
                  <TouchableOpacity
                    onPress={() => handleToggleTask(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        item.completed ? 'bg-success border-success' : 'border-muted'
                      }`}
                    >
                      {item.completed && (
                        <Text className="text-white text-xs">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View className="flex-1">
                    <Text
                      className={`text-base font-medium ${
                        item.completed ? 'text-muted line-through' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      {item.dueDate && (
                        <Text className="text-xs text-muted">
                          {formatDate(item.dueDate)}
                        </Text>
                      )}
                      {item.category && (
                        <View className="bg-background px-2 py-1 rounded">
                          <Text className="text-xs text-muted">{item.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {!item.completed && (
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteTask(item.id, item.title)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-error text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
