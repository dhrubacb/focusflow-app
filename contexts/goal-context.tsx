import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Goal, Milestone } from '@/types';
import { loadGoals, saveGoals } from '@/lib/storage';

interface GoalState {
  goals: Goal[];
  loading: boolean;
}

type GoalAction =
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'TOGGLE_MILESTONE'; payload: { goalId: string; milestoneId: string } }
  | { type: 'SET_LOADING'; payload: boolean };

interface GoalContextType extends GoalState {
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completedAt'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

function goalReducer(state: GoalState, action: GoalAction): GoalState {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };
    case 'TOGGLE_MILESTONE':
      return {
        ...state,
        goals: state.goals.map((g) => {
          if (g.id === action.payload.goalId) {
            const updatedMilestones = g.milestones.map((m) =>
              m.id === action.payload.milestoneId ? { ...m, completed: !m.completed } : m
            );
            const allCompleted = updatedMilestones.every((m) => m.completed);
            return {
              ...g,
              milestones: updatedMilestones,
              completedAt: allCompleted ? new Date().toISOString() : null,
            };
          }
          return g;
        }),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function GoalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(goalReducer, {
    goals: [],
    loading: true,
  });

  // Load goals on mount
  useEffect(() => {
    loadGoals().then((goals) => {
      dispatch({ type: 'SET_GOALS', payload: goals });
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, []);

  // Save goals whenever they change
  useEffect(() => {
    if (!state.loading) {
      saveGoals(state.goals);
    }
  }, [state.goals, state.loading]);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'completedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
  };

  const updateGoal = (goal: Goal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  };

  const deleteGoal = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    dispatch({ type: 'TOGGLE_MILESTONE', payload: { goalId, milestoneId } });
  };

  return (
    <GoalContext.Provider
      value={{
        ...state,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within GoalProvider');
  }
  return context;
}
