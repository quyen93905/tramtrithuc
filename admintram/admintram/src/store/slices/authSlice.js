import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";
import { fetchUserInfo } from "./userSlice";

// ========== Thunks ==========

// Đăng ký
export const registerThunk = createAsyncThunk(
    "auth/register",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await customAxios.post("/auth/register", formData);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Lỗi đăng ký." });
        }
    }
);

// Đăng nhập
export const loginThunk = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue, dispatch }) => {
        try {
            const res = await customAxios.post("/auth/login", credentials);
            if (res.status === 304) {
                throw new Error("Unexpected 304 Not Modified response");
            }
            localStorage.setItem("accessToken", res.data.data.accessToken);
            await dispatch(fetchUserInfo()).unwrap();
            return res.data.data;
        } catch (err) {
            const status = err.response?.status;
            let message = "Lỗi đăng nhập.";
            if (status === 401) {
                message = err.response?.data?.message || "Email hoặc mật khẩu không đúng.";
            } else if (err.code === "ERR_NETWORK") {
                message = "Lỗi kết nối server: Vui lòng kiểm tra kết nối mạng.";
            } else if (status === 403) {
                message = "Tài khoản của bạn đã bị vô hiệu hóa.";
            }
            console.error("Login error:", {
                status,
                data: err.response?.data,
                message: err.message,
                code: err.code,
            });
            return rejectWithValue({ message });
        }
    }
);

// Làm mới token
export const refreshTokenThunk = createAsyncThunk(
    "auth/refresh",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const res = await customAxios.post("/auth/refresh-token", {});
            return res.data.data; // { accessToken }
        } catch (err) {
            dispatch(logoutThunk()); // Đăng xuất nếu refresh thất bại
            return rejectWithValue(err.response?.data || { message: "Làm mới token thất bại." });
        }
    }
);

// Đăng xuất
export const logoutThunk = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await customAxios.post("/auth/logout", {});
        return true;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: "Lỗi đăng xuất." });
    }
});

// Quên mật khẩu
export const forgotPasswordThunk = createAsyncThunk(
    "auth/forgotPassword",
    async (email, { rejectWithValue }) => {
        try {
            const res = await customAxios.post("/auth/forgot-password", { email });
            showToast("success", res.data.message);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Không thể gửi yêu cầu.";
            showToast("error", message);
            return rejectWithValue({ message });
        }
    }
);

// Đặt lại mật khẩu
export const resetPasswordThunk = createAsyncThunk(
    "auth/resetPassword",
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            console.log("Sending reset password request", { token, newPassword });
            const res = await customAxios.post("/auth/reset-password", {
                token,
                newPassword,
            });
            console.log("Reset password response", res.data);
            showToast("success", res.data.message);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Không thể đặt lại mật khẩu.";
            showToast("error", message);
            return rejectWithValue({ message });
        }
    }
);

// ========== Initial State ==========

const initialState = {
    accessToken: localStorage.getItem("accessToken") || null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    loading: false,
    error: null,
    success: false,
};

// ========== Helpers ==========

const handlePending = (state) => {
    state.loading = true;
    state.error = null;
    state.success = false;
};

const handleRejected = (state, action, messageFallback) => {
    state.loading = false;
    state.success = false;
    const message = action.payload?.message || messageFallback;
    state.error = message;
    if (message.includes("304")) {
        state.error = "Lỗi server: Vui lòng thử lại.";
    }
    showToast("error", state.error);
};

// ========== Slice ==========

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },

        clearAuthState: (state) => {
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== LOGIN ==========
            .addCase(loginThunk.pending, handlePending)
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.success = true;
                localStorage.setItem("accessToken", action.payload.accessToken);
                showToast("success", "Đăng nhập thành công.");
            })
            .addCase(loginThunk.rejected, (state, action) => {
                handleRejected(state, action, "Đăng nhập thất bại.");
                state.isAuthenticated = false;
            })
            // ========== REGISTER ==========
            .addCase(registerThunk.pending, handlePending)
            .addCase(registerThunk.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                showToast("success", "Đăng ký thành công. Vui lòng đăng nhập.");
            })
            .addCase(registerThunk.rejected, (state, action) => {
                handleRejected(state, action, "Đăng ký thất bại.");
            })

            // ========== REFRESH ==========
            .addCase(refreshTokenThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                localStorage.setItem("accessToken", action.payload.accessToken);
            })
            .addCase(refreshTokenThunk.rejected, (state) => {
                state.loading = false;
                state.accessToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            })

            // ========== LOGOUT ==========
            .addCase(logoutThunk.fulfilled, (state) => {
                state.accessToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
                localStorage.removeItem("accessToken");
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Đăng xuất thất bại.";
                state.accessToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem("accessToken");
                showToast("error", state.error);
            })

            // ===== FORGOT PASSWORD =====
            .addCase(forgotPasswordThunk.pending, handlePending)
            .addCase(forgotPasswordThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(forgotPasswordThunk.rejected, (state, action) => {
                handleRejected(state, action, "Không thể gửi yêu cầu.");
            })

            // ===== RESET PASSWORD =====
            .addCase(resetPasswordThunk.pending, handlePending)
            .addCase(resetPasswordThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resetPasswordThunk.rejected, (state, action) => {
                handleRejected(state, action, "Không thể đặt lại mật khẩu.");
            });
    },
});

export const { resetAuthState, clearAuthState } = authSlice.actions;

export default authSlice.reducer;
