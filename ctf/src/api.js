import axios from 'axios';

// Use BACKEND_URL from .env file (accessed via Vite's import.meta.env)
// Default to Render backend if not set
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Keep for CORS compatibility
  headers: {
    'Content-Type': 'application/json'
  }
});



// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Central response handler
api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    // Handle 401 Unauthorized errors
    if (err.response?.status === 401) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Unauthorized';
      
      // Don't redirect if it's a login/signup request failing (wrong credentials)
      const isAuthEndpoint = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/signup');
      
      if (!isAuthEndpoint) {
        const currentPath = window.location.pathname;
        // Only redirect to login if not already on login page
        if (currentPath !== '/' && currentPath !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(err);
  }
);

// Auth endpoints
export const signup = async (payload) => {
  const res = await api.post('/auth/signup', payload);
  return res.data;
};

export const login = async (payload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

// Check if user is admin
export const checkIsAdmin = async () => {
  const res = await api.get('/admin/isAdmin');
  return res.data;
};

// Leaderboard endpoints
export const fetchLeaderboard = async () => {
  const res = await api.get('/leaderboard');
  return res.data;
};

// Fetch leaderboard with difficulty filter, e.g., fetchLeaderboard('beginner')
export const fetchLeaderboardByDifficulty = async (difficulty) => {
  const res = await api.get('/leaderboard', { params: { difficulty } });
  return res.data;
};

// Submission endpoints
export const submitAnswer = async ({ question_id, submitted_answer }) => {
  const res = await api.post('/submission', { question_id, submitted_answer });
  return res.data;
};

export const fetchSubmissionCategories = async () => {
  const res = await api.get('/submission/categories');
  return res.data;
};

export const fetchQuestionsByCategory = async (categoryId) => {
  const res = await api.post('/submission/questions', { categoryId });
  return res.data;
};

// Get individual question details
export const fetchQuestionDetails = async (question_id) => {
  const res = await api.post('/submission/question', { question_id });
  console.log('🔍 Frontend API - Fetched question details:', res.data);
  return res.data;
};

// Check if question is solved
export const checkQuestionSolved = async (question_id) => {
  const res = await api.post('/submission/is-solved', { question_id });
  return res.data;
};

// Fetch solved questions by category
export const fetchSolvedQuestions = async (categoryId) => {
  const res = await api.post('/submission/solved', { categoryId });
  return res.data;
};

// Fetch unsolved questions by category
export const fetchUnsolvedQuestions = async (categoryId) => {
  const res = await api.post('/submission/un-solved', { categoryId });
  return res.data;
};

// Admin endpoints (require auth/admin)
export const getCategoriesAdmin = async () => {
  const res = await api.get('/admin/categories');
  return res.data;
};

export const createCategoryAdmin = async (payload) => {
  const res = await api.post('/admin/categories', payload);
  return res.data;
};

// New endpoints for updating/deleting categories
export const updateCategoryAdmin = async (id, payload) => {
  const res = await api.patch(`/admin/categories/${id}`, payload);
  return res.data;
};

export const deleteCategoryAdmin = async (id) => {
  const res = await api.delete(`/admin/categories/${id}`);
  return res.data;
};

export const getQuestionsAdmin = async () => {
  const res = await api.get('/admin/questions');
  return res.data;
};

export const createQuestionAdmin = async (payload) => {
  const res = await api.post('/admin/questions', payload);
  return res.data;
};

export const updateQuestionAdmin = async (id, payload) => {
  const res = await api.patch(`/admin/questions/${id}`, payload);
  return res.data;
};

export const deleteQuestionAdmin = async (id) => {
  const res = await api.delete(`/admin/questions/${id}`);
  return res.data;
};

// Generic helpers
export const getBackendUrl = () => BASE_URL;

export default {
  api,
  signup,
  login,
  logout,
  fetchLeaderboard,
  submitAnswer,
  fetchSubmissionCategories,
  fetchQuestionsByCategory,
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  getQuestionsAdmin,
  createQuestionAdmin,
  updateQuestionAdmin,
  deleteQuestionAdmin,
  getBackendUrl
};
