import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
};

const logoutAndRedirect = () => {
  localStorage.clear();
  window.location.href = "/";
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isAuthRoute =
      originalRequest.url.includes("auth/login") ||
      originalRequest.url.includes("auth/refresh");

    if (err.response?.status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      logoutAndRedirect();
      return Promise.reject(err);
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/refresh/",
        { refresh: refreshToken }
      );
      const newAccess = res.data.access;
      localStorage.setItem("access", newAccess);
      processQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      logoutAndRedirect();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;