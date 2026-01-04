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
import { useGoals } from '@/contexts/goal-context';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import type { Milestone } from '@/types';

export default function GoalEditScreen() {
  const { goals, addGoal, updateGoal, deleteGoal, toggleMilestone } = useGoals();
  const colors = useColors();
  const params = useLocalSearchParams();
  const goalId = params.id as string | undefined;

  const existingGoal = goalId ? goals.find((g) => g.id === goalId) : null;

  const [title, setTitle] = useState(existingGoal?.title || '');
  const [description, setDescription] = useState(existingGoal?.description || '');
  const [targetDate, setTargetDate] = useState(
    existingGoal?.targetDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    existingGoal?.milestones || []
  );
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestoneTitle.trim(),
      completed: false,
    };

    setMilestones([...milestones, newMilestone]);
    setNewMilestoneTitle('');
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (existingGoal) {
      // If editing existing goal, use context function
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      toggleMilestone(existingGoal.id, milestoneId);
      // Update local state
      setMilestones(
        milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        )
      );
    } else {
      // If creating new goal, just update local state
      setMilestones(
        milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        )
      );
    }
  };

  const handleRemoveMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter((m) => m.id !== milestoneId));
  };

  const handleSave = () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a goal title');
      } else {
        Alert.alert('Error', 'Please enter a goal title');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (existingGoal) {
      updateGoal({
        ...existingGoal,
        title: title.trim(),
        description: description.trim(),
        targetDate: new Date(targetDate).toISOString(),
        milestones,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim(),
        targetDate: new Date(targetDate).toISOString(),
        milestones,
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingGoal) return;

    const confirmDelete = () => {
      deleteGoal(existingGoal.id);
      router.back();
    };

    if (Platform.OS === 'web') {
      if (confirm(`Delete "${existingGoal.title}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete Goal', `Are you sure you want to delete "${existingGoal.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  const progress = milestones.length > 0
    ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
    : 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pb-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text className="text-primary text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {existingGoal ? 'Edit Goal' : 'New Goal'}
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
              placeholder="e.g., Read 12 books this year"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What do you want to achieve?"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
              style={{ minHeight: 80 }}
            />
          </View>

          {/* Target Date */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Target Date</Text>
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Progress */}
          {milestones.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-muted mb-2">Progress</Text>
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-foreground mb-2">{progress}%</Text>
                <View className="h-2 bg-background rounded-full overflow-hidden">
                  <View
                    className="h-full bg-success rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Milestones */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Milestones</Text>
            
            {/* Add Milestone Input */}
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={newMilestoneTitle}
                onChangeText={setNewMilestoneTitle}
                placeholder="Add a milestone..."
                placeholderTextColor={colors.muted}
                className="flex-1 bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
                onSubmitEditing={handleAddMilestone}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddMilestone}
                className="bg-primary rounded-xl px-4 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>

            {/* Milestone List */}
            {milestones.length === 0 ? (
              <View className="bg-surface rounded-xl p-6 border border-border items-center">
                <Text className="text-muted text-center">No milestones yet</Text>
              </View>
            ) : (
              <View className="gap-2">
                {milestones.map((milestone) => (
                  <View
                    key={milestone.id}
                    className="bg-surface rounded-xl p-3 border border-border flex-row items-center gap-3"
                  >
                    <TouchableOpacity
                      onPress={() => handleToggleMilestone(milestone.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          milestone.completed ? 'bg-success border-success' : 'border-muted'
                        }`}
                      >
                        {milestone.completed && (
                          <Text className="text-white text-xs">✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <Text
                      className={`flex-1 text-base ${
                        milestone.completed ? 'text-muted line-through' : 'text-foreground'
                      }`}
                    >
                      {milestone.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveMilestone(milestone.id)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-error text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delete Button */}
          {existingGoal && (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-error rounded-xl py-3 mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">Delete Goal</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
