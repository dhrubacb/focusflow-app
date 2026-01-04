import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, TimeBlock, Goal } from '@/types';

const TASKS_KEY = '@focusflow_tasks';
const TIME_BLOCKS_KEY = '@focusflow_timeblocks';
const GOALS_KEY = '@focusflow_goals';

// Tasks
export async function loadTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

// Time Blocks
export async function loadTimeBlocks(): Promise<TimeBlock[]> {
  try {
    const data = await AsyncStorage.getItem(TIME_BLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading time blocks:', error);
    return [];
  }
}

export async function saveTimeBlocks(timeBlocks: TimeBlock[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TIME_BLOCKS_KEY, JSON.stringify(timeBlocks));
  } catch (error) {
    console.error('Error saving time blocks:', error);
  }
}

// Goals
export async function loadGoals(): Promise<Goal[]> {
  try {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals:', error);
  }
}

// Export/Import
export async function exportAllData(): Promise<string> {
  const tasks = await loadTasks();
  const timeBlocks = await loadTimeBlocks();
  const goals = await loadGoals();
  
  return JSON.stringify({
    tasks,
    timeBlocks,
    goals,
    exportDate: new Date().toISOString(),
  }, null, 2);
}

export async function importAllData(jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.tasks) await saveTasks(data.tasks);
    if (data.timeBlocks) await saveTimeBlocks(data.timeBlocks);
    if (data.goals) await saveGoals(data.goals);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
