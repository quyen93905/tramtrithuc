import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockNotifications } from "../../api/mockApi";

export const fetchNotificationsByUser = createAsyncThunk(
    "notification/fetchByUser",
    async (userId) => {
        return new Promise((resolve) =>
            setTimeout(() => {
                const result = mockNotifications.filter((n) => n.userId === userId);
                resolve(result);
            }, 300)
        );
    }
);

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        list: [],
        loading: false,
    },
    reducers: {
        markAsRead: (state, action) => {
            const id = action.payload;
            const noti = state.list.find((n) => n._id === id);
            if (noti) noti.isRead = true;
        },
        markAllAsRead: (state) => {
            state.list.forEach((n) => (n.isRead = true));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationsByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotificationsByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            });
    },
});

export const { markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
