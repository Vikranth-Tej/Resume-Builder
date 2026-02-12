import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://resume-builder-api-oags.onrender.com';

const api = axios.create({
    baseURL: API_URL.startsWith('http') ? API_URL : `https://${API_URL}`
});

// Add interceptor for token if needed in future
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('resume_builder_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
