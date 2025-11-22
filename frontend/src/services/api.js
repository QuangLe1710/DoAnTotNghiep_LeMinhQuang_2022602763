import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Trỏ đúng về Backend của bạn
});

// Tự động thêm Token vào Header cho các request sau này (để mua hàng, xem lịch sử...)
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