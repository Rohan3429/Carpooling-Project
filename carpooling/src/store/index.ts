import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ridesReducer from './slices/ridesSlice';
import bookingsReducer from './slices/bookingsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        rides: ridesReducer,
        bookings: bookingsReducer,
        notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
