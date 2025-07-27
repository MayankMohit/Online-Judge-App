import { configureStore } from '@reduxjs/toolkit'
import problemsReducer from '../features/problems/problemsSlice'
import codeReducer from '../features/code/codeSlice'
import favoritesReducer from '../features/favorites/favoritesSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import submissionsReducer from '../features/submissions/submissionsSlice'
import leaderboardReducer from "../features/leaderboard/leaderboardSlice"
import problemSubmissionsReducer from "../features/submissions/problemSubmissionsSlice"
import codePersistenceReducer from "../features/code/codePersistenceSlice"
import adminProblemsReducer from "../features/problems/adminProblemsSlice"
import adminUsersReducer from "../features/user/adminUsersSlice"

export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    code: codeReducer,
    favorites: favoritesReducer,
    dashboard: dashboardReducer,
    submissions: submissionsReducer,
    leaderboard: leaderboardReducer,
    problemSubmissions: problemSubmissionsReducer,
    codePersistence: codePersistenceReducer,
    adminProblems: adminProblemsReducer,
    adminUsers: adminUsersReducer,
  },
})