import { configureStore } from '@reduxjs/toolkit'
import problemsReducer from '../features/problems/problemsSlice'
import codeReducer from '../features/code/codeSlice'

export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    code: codeReducer
  },
})