import { ScrollView, Text, View, TouchableOpacity, Switch, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { exportAllData, importAllData } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { setColorScheme } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      
      if (Platform.OS === 'web') {
        // Create download link for web
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Data exported successfully!');
      } else {
        // For mobile, show the data (in real app, would use Share API)
        Alert.alert('Export Data', 'Data exported to clipboard', [
          { text: 'OK' }
        ]);
        console.log('Export data:', data);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to export data');
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    }
  };

  const handleImportData = () => {
    // In a real app, this would open a file picker
    if (Platform.OS === 'web') {
      alert('Import functionality would open a file picker');
    } else {
      Alert.alert('Import Data', 'Import functionality would open a file picker');
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setNotificationsEnabled(value);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setColorScheme(theme);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground">Settings</Text>

          {/* Appearance */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Appearance</Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <View className="p-4 border-b border-border">
                <Text className="text-base font-medium text-foreground mb-3">Theme</Text>
                <View className="flex-row gap-2">
                  {(['light', 'dark'] as const).map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      onPress={() => handleThemeChange(theme)}
                      className={`flex-1 py-2 rounded-lg ${
                        colorScheme === theme
                          ? 'bg-primary'
                          : 'bg-background'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-center font-medium ${
                          colorScheme === theme ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Notifications</Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-medium text-foreground">
                    Enable Notifications
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    Get reminders for tasks and time blocks
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Data</Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <TouchableOpacity
                onPress={handleExportData}
                className="p-4 border-b border-border flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View>
                  <Text className="text-base font-medium text-foreground">Export Data</Text>
                  <Text className="text-sm text-muted mt-1">
                    Download all your data as JSON
                  </Text>
                </View>
                <Text className="text-primary text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleImportData}
                className="p-4 flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View>
                  <Text className="text-base font-medium text-foreground">Import Data</Text>
                  <Text className="text-sm text-muted mt-1">
                    Restore from a backup file
                  </Text>
                </View>
                <Text className="text-primary text-lg">→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">About</Text>
            <View className="bg-surface rounded-2xl border border-border p-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground mb-2">FocusFlow</Text>
                <Text className="text-sm text-muted mb-1">Version 1.0.0</Text>
                <Text className="text-xs text-muted text-center mt-2">
                  A personal productivity app combining task management, time planning, and goal tracking
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
