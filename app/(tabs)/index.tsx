import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks } from "@/contexts/task-context";
import { useTimeBlocks } from "@/contexts/timeblock-context";
import { useGoals } from "@/contexts/goal-context";
import { useState, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function HomeScreen() {
  const { tasks, toggleTask } = useTasks();
  const { timeBlocks } = useTimeBlocks();
  const { goals } = useGoals();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Filter today's tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === today;
    });
  }, [tasks, today]);

  // Filter today's time blocks
  const todayTimeBlocks = useMemo(() => {
    return timeBlocks.filter(block => block.date === today).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [timeBlocks, today]);

  // Calculate stats
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const hoursPlanned = todayTimeBlocks.reduce((acc, block) => {
    const start = new Date(`2000-01-01T${block.startTime}`);
    const end = new Date(`2000-01-01T${block.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return acc + hours;
  }, 0);
  const activeGoals = goals.filter(g => !g.completedAt).length;

  const handleToggleTask = (taskId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTask(taskId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Today</Text>
            <Text className="text-base text-muted mt-1">{todayFormatted}</Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{completedToday}/{totalToday}</Text>
              <Text className="text-sm text-muted mt-1">Tasks</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{hoursPlanned.toFixed(1)}h</Text>
              <Text className="text-sm text-muted mt-1">Planned</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{activeGoals}</Text>
              <Text className="text-sm text-muted mt-1">Goals</Text>
            </View>
          </View>

          {/* Today's Tasks */}
          <View>
            <Text className="text-xl font-semibold text-foreground mb-3">Tasks</Text>
            {todayTasks.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <Text className="text-muted text-center">No tasks scheduled for today</Text>
              </View>
            ) : (
              <View className="gap-2">
                {todayTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => handleToggleTask(task.id)}
                    className="bg-surface rounded-xl p-4 border border-border flex-row items-center gap-3"
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        task.completed ? 'bg-success border-success' : 'border-muted'
                      }`}
                    >
                      {task.completed && (
                        <Text className="text-white text-xs">✓</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base ${
                          task.completed ? 'text-muted line-through' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </Text>
                      {task.category && (
                        <Text className="text-xs text-muted mt-1">{task.category}</Text>
                      )}
                    </View>
                    {task.priority === 'high' && !task.completed && (
                      <View className="w-2 h-2 rounded-full bg-error" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Today's Schedule */}
          <View>
            <Text className="text-xl font-semibold text-foreground mb-3">Schedule</Text>
            {todayTimeBlocks.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <Text className="text-muted text-center">No time blocks scheduled</Text>
              </View>
            ) : (
              <View className="gap-2">
                {todayTimeBlocks.map((block) => (
                  <View
                    key={block.id}
                    className="bg-surface rounded-xl p-4 border border-border"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: block.color || '#0066CC' }}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-medium text-foreground">
                          {block.title}
                        </Text>
                        <Text className="text-sm text-muted mt-1">
                          {block.startTime} - {block.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
