import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username, password) => {
  const response = await api.post('/api/login', { username, password });
  return response.data;
};

export const register = async (username, password, user_type) => {
  const response = await api.post('/api/register', { username, password, user_type });
  return response.data;
};

export const getTrials = async () => {
  const response = await api.get('/api/trials');
  return response.data;
};

export const getTrialFields = async (trialType) => {
  const response = await api.get(`/api/trial-fields/${trialType}`);
  return response.data;
};

export const submitApplication = async (trialType, patientData, username) => {
  const response = await api.post('/api/patient/apply', {
    trial_type: trialType,
    patient_data: patientData,
    username,
  });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/api/analytics');
  return response.data;
};

export const getPatients = async (trialType) => {
  const response = await api.get(`/api/patients/${trialType}`);
  return response.data;
};

export const getAdminUsers = async (role = 'all', page = 1, search = '') => {
  const response = await api.get('/api/admin/users', {
    params: { role, page, search },
  });
  return response.data;
};

export const getMyApplications = async (username) => {
  const response = await api.get('/api/applications/me', {
    params: { username },
  });
  return response.data;
};

export default api;
