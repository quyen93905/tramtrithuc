import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import documentReducer from "./slices/documentSlice";
import categoryReducer from "./slices/categorySlice";
import commentReducer from "./slices/commentSlice";
import notificationReducer from "./slices/notificationSlice";
import downloadReducer from "./slices/downloadSlice";
import ratingReducer from "./slices/ratingSlice";
import adminReducer from "./slices/adminSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        documents: documentReducer,
        categories: categoryReducer,
        comments: commentReducer,
        notifications: notificationReducer,
        download: downloadReducer,
        ratings: ratingReducer,
        admin: adminReducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
    // devTools: process.env.NODE_ENV !== "production",
});
