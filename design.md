# Personal Productivity App - Design Document

## Overview
A comprehensive mobile productivity app combining task management, time planning, and goal tracking in a unified experience. The app follows Apple Human Interface Guidelines and is designed for one-handed usage in portrait orientation (9:16).

## Design Principles
- **Mobile-first**: Optimized for portrait orientation and one-handed interaction
- **iOS-native feel**: Follows Apple HIG for familiar, intuitive interactions
- **Unified experience**: Seamlessly integrates tasks, time, and goals
- **Local-first**: All data stored locally using AsyncStorage (no backend required)
- **Quick access**: Minimal taps to complete common actions

## Color Scheme
- **Primary**: Deep Blue (#0066CC) - Trust, productivity, focus
- **Background Light**: White (#FFFFFF)
- **Background Dark**: Near Black (#151718)
- **Surface Light**: Light Gray (#F5F5F5)
- **Surface Dark**: Dark Gray (#1E2022)
- **Success**: Green (#22C55E) - Completed tasks
- **Warning**: Amber (#F59E0B) - Due soon
- **Error**: Red (#EF4444) - Overdue

## Screen List

### 1. Home Screen (Today View)
**Primary Content:**
- Current date and day of week header
- Quick stats: tasks completed today, hours planned, active goals
- Today's tasks list with checkboxes
- Time blocks for today (visual timeline)
- Quick add button (floating action button)

**Functionality:**
- Check/uncheck tasks
- Tap task to view details
- Tap time block to view/edit
- Pull to refresh
- Quick add task/time block

### 2. Tasks Screen
**Primary Content:**
- Segmented control: All / Today / Upcoming / Completed
- Task list grouped by category or date
- Each task shows: title, due date, priority indicator, category tag
- Empty state illustration when no tasks

**Functionality:**
- Add new task (+ button)
- Tap task to view/edit details
- Swipe actions: complete, delete, edit
- Filter by category
- Search tasks

### 3. Task Detail / Edit Screen
**Primary Content:**
- Task title (large text input)
- Due date picker
- Priority selector (High/Medium/Low with color indicators)
- Category picker
- Notes field (multiline)
- Delete button (bottom, destructive style)

**Functionality:**
- Edit all task properties
- Save changes
- Delete task with confirmation
- Back navigation

### 4. Calendar / Time Planning Screen
**Primary Content:**
- Week view calendar at top
- Day selector (horizontal scroll)
- Time blocks for selected day (vertical timeline)
- Each block shows: title, time range, color coding
- Add time block button

**Functionality:**
- Navigate between days
- Add time block
- Tap block to edit
- Drag to adjust duration (optional polish)
- View weekly overview

### 5. Time Block Detail / Edit Screen
**Primary Content:**
- Title input
- Start time picker
- End time picker (or duration)
- Category/color selector
- Notes field
- Delete button

**Functionality:**
- Edit time block properties
- Save changes
- Delete block
- Back navigation

### 6. Goals Screen
**Primary Content:**
- Active goals list
- Each goal card shows:
  - Goal title
  - Progress bar with percentage
  - Target date
  - Current vs target metrics
- Completed goals section (collapsed)
- Add goal button

**Functionality:**
- Add new goal
- Tap goal to view details
- Mark milestone complete
- Archive completed goals

### 7. Goal Detail / Edit Screen
**Primary Content:**
- Goal title
- Description
- Target date
- Milestones list (checkboxes)
- Progress visualization
- Related tasks count
- Delete button

**Functionality:**
- Edit goal properties
- Add/remove milestones
- Check off milestones
- View related tasks
- Delete goal

### 8. Settings Screen
**Primary Content:**
- Appearance: Light/Dark/Auto
- Notifications toggle
- Default task category
- Week start day
- Data management: Export/Import
- About section

**Functionality:**
- Toggle settings
- Export data as JSON
- Import data from JSON
- View app version

## Key User Flows

### Flow 1: Quick Add Task
1. User taps floating "+" button on Home screen
2. Bottom sheet appears with task input
3. User types task title
4. User optionally sets due date (defaults to today)
5. User taps "Add" button
6. Sheet dismisses, task appears in list with haptic feedback

### Flow 2: Plan Daily Schedule
1. User navigates to Calendar tab
2. User sees today's date selected
3. User taps "+" to add time block
4. User enters: "Morning workout", 7:00 AM - 8:00 AM
5. User taps Save
6. Block appears in timeline
7. User repeats for other blocks (work, lunch, meetings, etc.)

### Flow 3: Create and Track Goal
1. User navigates to Goals tab
2. User taps "+" button
3. User enters goal: "Read 12 books this year"
4. User sets target date: Dec 31, 2026
5. User adds milestones: "Book 1", "Book 2", etc.
6. User taps Save
7. Goal card appears with 0% progress
8. As user checks off milestones, progress bar updates

### Flow 4: Complete Daily Tasks
1. User opens app to Home screen
2. User sees today's task list
3. User taps checkbox next to "Morning workout"
4. Task animates with checkmark, moves to completed section
5. Haptic feedback confirms action
6. Quick stats update: "3/8 tasks completed"

### Flow 5: Review and Adjust Schedule
1. User opens Calendar tab
2. User swipes to view tomorrow
3. User sees time blocks are too packed
4. User taps on "Team meeting" block
5. User adjusts time from 2 hours to 1 hour
6. User taps Save
7. Timeline updates with new spacing

## Navigation Structure

**Tab Bar (Bottom):**
- Home (house.fill icon)
- Tasks (checklist icon)
- Calendar (calendar icon)
- Goals (target icon)
- Settings (gear icon)

**Navigation Patterns:**
- Tabs for main sections
- Modal sheets for quick actions (add task, add time block)
- Push navigation for detail screens
- Swipe back gesture enabled

## Data Models

### Task
```typescript
{
  id: string
  title: string
  completed: boolean
  dueDate: string | null
  priority: 'high' | 'medium' | 'low'
  category: string
  notes: string
  createdAt: string
  completedAt: string | null
}
```

### TimeBlock
```typescript
{
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  category: string
  color: string
  notes: string
}
```

### Goal
```typescript
{
  id: string
  title: string
  description: string
  targetDate: string
  milestones: Array<{
    id: string
    title: string
    completed: boolean
  }>
  createdAt: string
  completedAt: string | null
}
```

## Interaction Patterns

### Gestures
- **Tap**: Select, open details
- **Long press**: Quick actions menu (optional)
- **Swipe left/right on list items**: Reveal actions (complete, delete)
- **Pull down**: Refresh (on Home screen)
- **Swipe back**: Navigate back

### Feedback
- **Haptics**: Light impact on button taps, medium on toggles, success on completions
- **Animations**: Subtle fade-ins (250ms), checkbox animations, progress bar fills
- **Visual states**: Pressed opacity (0.7), disabled opacity (0.5)

### Empty States
- Friendly illustrations
- Clear call-to-action text
- Prominent add button

## Technical Approach
- **State Management**: React Context + useReducer for each domain (tasks, timeBlocks, goals)
- **Persistence**: AsyncStorage for all data
- **Date Handling**: Native Date objects, format with Intl.DateTimeFormat
- **Lists**: FlatList for all scrollable lists
- **Forms**: Controlled inputs with validation
- **Styling**: NativeWind (Tailwind CSS)
