import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, FilterType, SortType } from '../types';
import { logout } from './authSlice';

interface TasksState {
  items: Task[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  filter: FilterType;
  sort: SortType;
  searchQuery: string;
}

const initialState: TasksState = {
  items: [],
  loading: 'idle',
  error: null,
  filter: 'all',
  sort: 'date-desc',
  searchQuery: '',
};

interface ThunkApiConfig {
  state: { auth: { token: string | null } };
}

// Helper for authorized API calls
const callApi = async (url: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong with tasks API');
  }
  return data;
};


// Async Thunks
export const fetchTasks = createAsyncThunk<Task[], void, ThunkApiConfig>(
  'tasks/fetchTasks',
  async (_, { getState }) => {
    const token = getState().auth.token;
    if (!token) throw new Error('Not authenticated');
    return callApi('/api/tasks', token);
  }
);

export const addTask = createAsyncThunk<Task, Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'completedAt'>, ThunkApiConfig>(
  'tasks/addTask',
  async (taskData, { getState }) => {
    const token = getState().auth.token;
    if (!token) throw new Error('Not authenticated');
    return callApi('/api/tasks', token, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }
);

export const updateTask = createAsyncThunk<Task, { id: string; updates: Partial<Task> }, ThunkApiConfig>(
  'tasks/updateTask',
  async ({ id, updates }, { getState }) => {
    const token = getState().auth.token;
    if (!token) throw new Error('Not authenticated');
    return callApi(`/api/tasks/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
);

export const deleteTask = createAsyncThunk<{ id: string }, string, ThunkApiConfig>(
  'tasks/deleteTask',
  async (id, { getState }) => {
    const token = getState().auth.token;
    if (!token) throw new Error('Not authenticated');
    return callApi(`/api/tasks/${id}`, token, { method: 'DELETE' });
  }
);

export const toggleTaskCompletion = createAsyncThunk<Task, string, { state: { tasks: TasksState } & ThunkApiConfig['state'] }>(
  'tasks/toggleTaskCompletion',
  async (id, { getState }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) throw new Error('Not authenticated');
    
    const task = state.tasks.items.find((t) => t.id === id);
    if (!task) throw new Error('Task not found for toggling completion');
      
    const updates: Partial<Task> = { isCompleted: !task.isCompleted };
    if (!task.isCompleted) { // If becoming completed
      updates.completedAt = new Date().toISOString();
    } else { // If becoming pending
      updates.completedAt = undefined;
    }
    
    return callApi(`/api/tasks/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
);


const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<FilterType>) {
      state.filter = action.payload;
    },
    setSort(state, action: PayloadAction<SortType>) {
      state.sort = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(fetchTasks.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add to beginning for better UX
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload.id);
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('tasks/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = 'failed';
          state.error = action.error?.message || 'Failed to process task request.';
        }
      );
  },
});

export const { setFilter, setSort, setSearchQuery } = tasksSlice.actions;

export default tasksSlice.reducer;