import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiErrorMessage } from '../../api/client';
import * as tasksApi from '../../api/tasksApi';
import { Task, TaskInput, TaskQuery } from '../../types';

interface TasksState {
  items: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchTasks = createAsyncThunk<
  Task[],
  TaskQuery | undefined,
  { rejectValue: string }
>('tasks/fetch', async (query, { rejectWithValue }) => {
  try {
    return await tasksApi.listTasks(query);
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const addTask = createAsyncThunk<
  Task,
  TaskInput,
  { rejectValue: string }
>('tasks/add', async (input, { rejectWithValue }) => {
  try {
    return await tasksApi.createTask(input);
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const editTask = createAsyncThunk<
  Task,
  { id: string; input: Partial<TaskInput> & { completed?: boolean } },
  { rejectValue: string }
>('tasks/edit', async ({ id, input }, { rejectWithValue }) => {
  try {
    return await tasksApi.updateTask(id, input);
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const removeTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tasks/remove', async (id, { rejectWithValue }) => {
  try {
    await tasksApi.deleteTask(id);
    return id;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Could not load your tasks.';
      })
      .addCase(addTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(addTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Could not create the task.';
      })
      .addCase(editTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        );
      })
      .addCase(editTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Could not update the task.';
      })
      .addCase(removeTask.pending, (state) => {
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not delete the task.';
      });
  },
});

export const { clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
