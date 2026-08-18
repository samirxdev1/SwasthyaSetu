import api from './api';

const handleApiError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An unexpected authentication error occurred.');
};

export const loginUser = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const registerDoctor = async (formData) => {
  try {
    const response = await api.post('/auth/register/doctor', formData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const registerLaboratory = async (formData) => {
  try {
    const response = await api.post('/auth/register/laboratory', formData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default {
  loginUser,
  registerDoctor,
  registerLaboratory,
  getCurrentUser,
};
