import axios from "axios";

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// Request interceptor — add auth token if present
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token from localStorage if available
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;
