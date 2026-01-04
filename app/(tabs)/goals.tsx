import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useGoals } from "@/contexts/goal-context";
import { useMemo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export default function GoalsScreen() {
  const { goals } = useGoals();
  const colors = useColors();

  const { activeGoals, completedGoals } = useMemo(() => {
    const active = goals.filter(g => !g.completedAt);
    const completed = goals.filter(g => g.completedAt);
    return { activeGoals: active, completedGoals: completed };
  }, [goals]);

  const calculateProgress = (goal: typeof goals[0]) => {
    if (goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const renderGoalCard = (goal: typeof goals[0]) => {
    const progress = calculateProgress(goal);
    const isCompleted = goal.completedAt !== null;

    return (
      <TouchableOpacity
        key={goal.id}
        onPress={() => router.push(`/goal-edit?id=${goal.id}`)}
        className="bg-surface rounded-2xl p-5 border border-border mb-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text className={`text-lg font-semibold ${isCompleted ? 'text-muted line-through' : 'text-foreground'}`}>
              {goal.title}
            </Text>
            {goal.description && (
              <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                {goal.description}
              </Text>
            )}
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-muted">Progress</Text>
            <Text className="text-sm font-semibold text-foreground">{progress}%</Text>
          </View>
          <View className="h-2 bg-background rounded-full overflow-hidden">
            <View
              className="h-full bg-success rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">
            {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} milestones
          </Text>
          <Text className="text-xs text-muted">
            {isCompleted ? 'Completed' : `Due ${formatDate(goal.targetDate)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Goals</Text>
            <TouchableOpacity
              onPress={() => router.push('/goal-edit')}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={[...activeGoals, ...completedGoals]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="bg-surface rounded-2xl p-8 border border-border items-center">
              <Text className="text-muted text-center text-base">No goals yet</Text>
              <Text className="text-muted text-center text-sm mt-2">
                Tap + to create your first goal
              </Text>
            </View>
          }
          ListHeaderComponent={
            activeGoals.length > 0 && completedGoals.length > 0 ? (
              <Text className="text-lg font-semibold text-foreground mb-3">Active Goals</Text>
            ) : null
          }
          renderItem={({ item, index }) => {
            const showCompletedHeader = index === activeGoals.length && completedGoals.length > 0;
            return (
              <View>
                {showCompletedHeader && (
                  <Text className="text-lg font-semibold text-foreground mb-3 mt-4">
                    Completed Goals
                  </Text>
                )}
                {renderGoalCard(item)}
              </View>
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}
