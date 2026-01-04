import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useTasks } from '@/contexts/task-context';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

export default function TaskEditScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const colors = useColors();
  const params = useLocalSearchParams();
  const taskId = params.id as string | undefined;

  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [dueDate, setDueDate] = useState(
    existingTask?.dueDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(
    existingTask?.priority || 'medium'
  );
  const [category, setCategory] = useState(existingTask?.category || '');
  const [notes, setNotes] = useState(existingTask?.notes || '');

  const handleSave = () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a task title');
      } else {
        Alert.alert('Error', 'Please enter a task title');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (existingTask) {
      updateTask({
        ...existingTask,
        title: title.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        category: category.trim(),
        notes: notes.trim(),
      });
    } else {
      addTask({
        title: title.trim(),
        completed: false,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        category: category.trim(),
        notes: notes.trim(),
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingTask) return;

    const confirmDelete = () => {
      deleteTask(existingTask.id);
      router.back();
    };

    if (Platform.OS === 'web') {
      if (confirm(`Delete "${existingTask.title}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete Task', `Are you sure you want to delete "${existingTask.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pb-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text className="text-primary text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {existingTask ? 'Edit Task' : 'New Task'}
          </Text>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
            <Text className="text-primary text-base font-semibold">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, gap: 24 }}>
          {/* Title */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Due Date */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Due Date</Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Priority */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Priority</Text>
            <View className="flex-row gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 py-3 rounded-xl border ${
                    priority === p
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center font-medium ${
                      priority === p ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Category</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Work, Personal, Health"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
              style={{ minHeight: 100 }}
            />
          </View>

          {/* Delete Button */}
          {existingTask && (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-error rounded-xl py-3 mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">Delete Task</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
