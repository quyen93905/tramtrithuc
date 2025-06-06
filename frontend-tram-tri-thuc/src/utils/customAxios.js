import axios from "axios";


// Base URL của backend
const REACT_APP_API_URL = "https://be-fg2g.onrender.com/api/v1";


const customAxios = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Biến lưu trữ trạng thái làm mới token để tránh gọi đồng thời
let isRefreshing = false;
let failedQueue = [];

// Xử lý hàng đợi các request thất bại
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor cho request: Thêm accessToken vào header
customAxios.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        config.headers["Cache-Control"] = "no-cache";
        console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            withCredentials: config.withCredentials,
            data: config.data,
        });
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho response: Xử lý lỗi 401 và làm mới token
customAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response && !originalRequest._retry) {
            originalRequest._retry = true;
            return new Promise((resolve) => {
                setTimeout(() => resolve(customAxios(originalRequest)), 1000);
            });
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            error.config.url !== "/auth/refresh-token" &&
            error.config.url !== "/auth/login"
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return customAxios(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log("Refreshing token...");
                const response = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;
                localStorage.setItem("accessToken", accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);

                console.log("Token refreshed successfully");
                return customAxios(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed:", {
                    status: refreshError.response?.status,
                    data: refreshError.response?.data,
                    message: refreshError.message,
                });
                processQueue(refreshError, null);
                localStorage.removeItem("accessToken");
                window.location.href = "/auth/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 401 && error.config.url === "/auth/login") {
            console.error("Login failed:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(error);
        }

        console.error("API error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
        });
        return Promise.reject(error);
    }
);

export default customAxios;
