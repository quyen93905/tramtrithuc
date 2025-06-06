import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockDownloads } from "../../api/mockApi";

export const fetchDownloadsByUser = createAsyncThunk("download/fetchByUser", async (userId) => {
    return new Promise((resolve) =>
        setTimeout(() => {
            const result = mockDownloads.filter((d) => d.userId === userId);
            resolve(result);
        }, 300)
    );
});

const downloadSlice = createSlice({
    name: "download",
    initialState: {
        history: [],
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDownloadsByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDownloadsByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            });
    },
});

export default downloadSlice.reducer;
