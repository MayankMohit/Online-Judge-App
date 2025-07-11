import { configureStore } from '@reduxjs/toolkit'
import problemsReducer from '../features/problems/problemsSlice'

export const store = configureStore({
  reducer: {
    problems: problemsReducer,
  },
})