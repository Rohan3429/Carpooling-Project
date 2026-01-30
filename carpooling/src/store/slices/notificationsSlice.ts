import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.read).length;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount -= 1;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
