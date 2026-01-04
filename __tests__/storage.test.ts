import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadTasks,
  saveTasks,
  loadTimeBlocks,
  saveTimeBlocks,
  loadGoals,
  saveGoals,
  exportAllData,
  importAllData,
} from '@/lib/storage';
import type { Task, TimeBlock, Goal } from '@/types';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('Storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tasks', () => {
    it('should load tasks from AsyncStorage', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          dueDate: '2026-01-05',
          priority: 'high',
          category: 'Work',
          notes: 'Test notes',
          createdAt: '2026-01-04',
          completedAt: null,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockTasks));

      const tasks = await loadTasks();
      expect(tasks).toEqual(mockTasks);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@focusflow_tasks');
    });

    it('should return empty array when no tasks exist', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

      const tasks = await loadTasks();
      expect(tasks).toEqual([]);
    });

    it('should save tasks to AsyncStorage', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          completed: false,
          dueDate: '2026-01-05',
          priority: 'medium',
          category: 'Personal',
          notes: '',
          createdAt: '2026-01-04',
          completedAt: null,
        },
      ];

      await saveTasks(mockTasks);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@focusflow_tasks',
        JSON.stringify(mockTasks)
      );
    });
  });

  describe('TimeBlocks', () => {
    it('should load time blocks from AsyncStorage', async () => {
      const mockBlocks: TimeBlock[] = [
        {
          id: '1',
          title: 'Morning Meeting',
          date: '2026-01-05',
          startTime: '09:00',
          endTime: '10:00',
          category: 'Work',
          color: '#0066CC',
          notes: '',
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockBlocks));

      const blocks = await loadTimeBlocks();
      expect(blocks).toEqual(mockBlocks);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@focusflow_timeblocks');
    });

    it('should save time blocks to AsyncStorage', async () => {
      const mockBlocks: TimeBlock[] = [
        {
          id: '1',
          title: 'Workout',
          date: '2026-01-05',
          startTime: '07:00',
          endTime: '08:00',
          category: 'Health',
          color: '#22C55E',
          notes: '',
        },
      ];

      await saveTimeBlocks(mockBlocks);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@focusflow_timeblocks',
        JSON.stringify(mockBlocks)
      );
    });
  });

  describe('Goals', () => {
    it('should load goals from AsyncStorage', async () => {
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Read 12 books',
          description: 'Read one book per month',
          targetDate: '2026-12-31',
          milestones: [
            { id: '1', title: 'Book 1', completed: true },
            { id: '2', title: 'Book 2', completed: false },
          ],
          createdAt: '2026-01-04',
          completedAt: null,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockGoals));

      const goals = await loadGoals();
      expect(goals).toEqual(mockGoals);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@focusflow_goals');
    });

    it('should save goals to AsyncStorage', async () => {
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Learn TypeScript',
          description: 'Master TypeScript fundamentals',
          targetDate: '2026-06-30',
          milestones: [],
          createdAt: '2026-01-04',
          completedAt: null,
        },
      ];

      await saveGoals(mockGoals);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@focusflow_goals',
        JSON.stringify(mockGoals)
      );
    });
  });

  describe('Export/Import', () => {
    it('should export all data as JSON', async () => {
      const mockTasks: Task[] = [{ id: '1', title: 'Task', completed: false, dueDate: null, priority: 'low', category: '', notes: '', createdAt: '2026-01-04', completedAt: null }];
      const mockBlocks: TimeBlock[] = [{ id: '1', title: 'Block', date: '2026-01-05', startTime: '09:00', endTime: '10:00', category: '', color: '#0066CC', notes: '' }];
      const mockGoals: Goal[] = [{ id: '1', title: 'Goal', description: '', targetDate: '2026-12-31', milestones: [], createdAt: '2026-01-04', completedAt: null }];

      vi.mocked(AsyncStorage.getItem)
        .mockResolvedValueOnce(JSON.stringify(mockTasks))
        .mockResolvedValueOnce(JSON.stringify(mockBlocks))
        .mockResolvedValueOnce(JSON.stringify(mockGoals));

      const exportedData = await exportAllData();
      const parsed = JSON.parse(exportedData);

      expect(parsed.tasks).toEqual(mockTasks);
      expect(parsed.timeBlocks).toEqual(mockBlocks);
      expect(parsed.goals).toEqual(mockGoals);
      expect(parsed.exportDate).toBeDefined();
    });

    it('should import data from JSON', async () => {
      const importData = {
        tasks: [{ id: '1', title: 'Imported Task', completed: false, dueDate: null, priority: 'medium', category: '', notes: '', createdAt: '2026-01-04', completedAt: null }],
        timeBlocks: [],
        goals: [],
      };

      const result = await importAllData(JSON.stringify(importData));

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@focusflow_tasks',
        JSON.stringify(importData.tasks)
      );
    });
  });
});
