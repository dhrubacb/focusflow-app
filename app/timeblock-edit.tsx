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
import { useTimeBlocks } from '@/contexts/timeblock-context';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

const PRESET_COLORS = [
  '#0066CC', // Blue
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export default function TimeBlockEditScreen() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useTimeBlocks();
  const colors = useColors();
  const params = useLocalSearchParams();
  const blockId = params.id as string | undefined;

  const existingBlock = blockId ? timeBlocks.find((b) => b.id === blockId) : null;

  const [title, setTitle] = useState(existingBlock?.title || '');
  const [date, setDate] = useState(
    existingBlock?.date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(existingBlock?.startTime || '09:00');
  const [endTime, setEndTime] = useState(existingBlock?.endTime || '10:00');
  const [category, setCategory] = useState(existingBlock?.category || '');
  const [color, setColor] = useState(existingBlock?.color || PRESET_COLORS[0]);
  const [notes, setNotes] = useState(existingBlock?.notes || '');

  const handleSave = () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a title');
      } else {
        Alert.alert('Error', 'Please enter a title');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (existingBlock) {
      updateTimeBlock({
        ...existingBlock,
        title: title.trim(),
        date,
        startTime,
        endTime,
        category: category.trim(),
        color,
        notes: notes.trim(),
      });
    } else {
      addTimeBlock({
        title: title.trim(),
        date,
        startTime,
        endTime,
        category: category.trim(),
        color,
        notes: notes.trim(),
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingBlock) return;

    const confirmDelete = () => {
      deleteTimeBlock(existingBlock.id);
      router.back();
    };

    if (Platform.OS === 'web') {
      if (confirm(`Delete "${existingBlock.title}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete Time Block', `Are you sure you want to delete "${existingBlock.title}"?`, [
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
            {existingBlock ? 'Edit Time Block' : 'New Time Block'}
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
              placeholder="e.g., Team Meeting"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Date */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
            />
          </View>

          {/* Time */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-muted mb-2">Start Time</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-muted mb-2">End Time</Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 border border-border text-base text-foreground"
              />
            </View>
          </View>

          {/* Color */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Color</Text>
            <View className="flex-row gap-3">
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    color === c ? 'border-4 border-foreground' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  activeOpacity={0.7}
                >
                  {color === c && <Text className="text-white text-lg">✓</Text>}
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
              placeholder="e.g., Work, Personal"
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
          {existingBlock && (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-error rounded-xl py-3 mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">Delete Time Block</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
