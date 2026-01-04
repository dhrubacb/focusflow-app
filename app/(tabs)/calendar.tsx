import { FlatList, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTimeBlocks } from "@/contexts/timeblock-context";
import { useState, useMemo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

export default function CalendarScreen() {
  const { timeBlocks } = useTimeBlocks();
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay();
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [selectedDate]);

  const selectedDateBlocks = useMemo(() => {
    return timeBlocks
      .filter(block => block.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeBlocks, selectedDate]);

  const formatDayName = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  const formatDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const isToday = (dateString: string) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground">Calendar</Text>
            <TouchableOpacity
              onPress={() => router.push('/timeblock-edit')}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Week Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {weekDates.map((date) => (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                className={`items-center justify-center w-14 h-16 rounded-xl ${
                  selectedDate === date
                    ? 'bg-primary'
                    : isToday(date)
                    ? 'bg-surface border-2 border-primary'
                    : 'bg-surface border border-border'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedDate === date ? 'text-white' : 'text-muted'
                  }`}
                >
                  {formatDayName(date)}
                </Text>
                <Text
                  className={`text-lg font-bold mt-1 ${
                    selectedDate === date
                      ? 'text-white'
                      : isToday(date)
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {formatDayNumber(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Blocks */}
        <View className="flex-1 px-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            {new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date(selectedDate))}
          </Text>

          <FlatList
            data={selectedDateBlocks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <View className="bg-surface rounded-2xl p-8 border border-border items-center">
                <Text className="text-muted text-center text-base">
                  No time blocks scheduled
                </Text>
                <Text className="text-muted text-center text-sm mt-2">
                  Tap + to add a time block
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/timeblock-edit?id=${item.id}`)}
                className="bg-surface rounded-xl p-4 border border-border mb-3"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-1 h-16 rounded-full"
                    style={{ backgroundColor: item.color || '#0066CC' }}
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {item.title}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {item.startTime} - {item.endTime}
                    </Text>
                    {item.category && (
                      <View className="bg-background px-2 py-1 rounded mt-2 self-start">
                        <Text className="text-xs text-muted">{item.category}</Text>
                      </View>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
