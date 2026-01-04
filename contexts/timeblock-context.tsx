import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { TimeBlock } from '@/types';
import { loadTimeBlocks, saveTimeBlocks } from '@/lib/storage';

interface TimeBlockState {
  timeBlocks: TimeBlock[];
  loading: boolean;
}

type TimeBlockAction =
  | { type: 'SET_TIME_BLOCKS'; payload: TimeBlock[] }
  | { type: 'ADD_TIME_BLOCK'; payload: TimeBlock }
  | { type: 'UPDATE_TIME_BLOCK'; payload: TimeBlock }
  | { type: 'DELETE_TIME_BLOCK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

interface TimeBlockContextType extends TimeBlockState {
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (timeBlock: TimeBlock) => void;
  deleteTimeBlock: (id: string) => void;
}

const TimeBlockContext = createContext<TimeBlockContextType | undefined>(undefined);

function timeBlockReducer(state: TimeBlockState, action: TimeBlockAction): TimeBlockState {
  switch (action.type) {
    case 'SET_TIME_BLOCKS':
      return { ...state, timeBlocks: action.payload };
    case 'ADD_TIME_BLOCK':
      return { ...state, timeBlocks: [...state.timeBlocks, action.payload] };
    case 'UPDATE_TIME_BLOCK':
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((tb) =>
          tb.id === action.payload.id ? action.payload : tb
        ),
      };
    case 'DELETE_TIME_BLOCK':
      return {
        ...state,
        timeBlocks: state.timeBlocks.filter((tb) => tb.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function TimeBlockProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timeBlockReducer, {
    timeBlocks: [],
    loading: true,
  });

  // Load time blocks on mount
  useEffect(() => {
    loadTimeBlocks().then((timeBlocks) => {
      dispatch({ type: 'SET_TIME_BLOCKS', payload: timeBlocks });
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, []);

  // Save time blocks whenever they change
  useEffect(() => {
    if (!state.loading) {
      saveTimeBlocks(state.timeBlocks);
    }
  }, [state.timeBlocks, state.loading]);

  const addTimeBlock = (timeBlockData: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock: TimeBlock = {
      ...timeBlockData,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_TIME_BLOCK', payload: newTimeBlock });
  };

  const updateTimeBlock = (timeBlock: TimeBlock) => {
    dispatch({ type: 'UPDATE_TIME_BLOCK', payload: timeBlock });
  };

  const deleteTimeBlock = (id: string) => {
    dispatch({ type: 'DELETE_TIME_BLOCK', payload: id });
  };

  return (
    <TimeBlockContext.Provider
      value={{
        ...state,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
      }}
    >
      {children}
    </TimeBlockContext.Provider>
  );
}

export function useTimeBlocks() {
  const context = useContext(TimeBlockContext);
  if (!context) {
    throw new Error('useTimeBlocks must be used within TimeBlockProvider');
  }
  return context;
}
