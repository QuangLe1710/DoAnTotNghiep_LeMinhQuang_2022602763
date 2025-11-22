import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Link Backend Spring Boot
});

// Tự động thêm Token vào Header nếu có
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;