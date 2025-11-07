import axios from "axios";

// 1. Create the Axios instance
const api = axios.create({
  baseURL: "http://localhost:5001/api", // Your backend's URL
});

// 2. Create an "interceptor" to add the token to every request
api.interceptors.request.use(
  (config) => {
    // 3. Get the token from localStorage
    const token = localStorage.getItem("token");

    // 4. If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default api;
