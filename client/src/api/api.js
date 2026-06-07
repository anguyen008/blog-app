// api/api.js
// ─────────────────────────────────────────────
// API utility functions for frontend to interact with backend
// Includes user registration, login, and data fetching
// Note: In a production app, you would want to handle authentication tokens,
// error handling, and other API interactions more robustly.
// ─────────────────────────────────────────────
import axios from 'axios';

// Base URL for backend API (env variable or hardcoded for development)
const backendUrl = 'http://127.0.0.1:8000';

function fetchData() {
  return axios.get(`${backendUrl}/`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

export { fetchData };

async function loginUser({ email, password }) {
  const formData = new URLSearchParams({ username: email, password })
  try {
    const response = await axios.post(`${backendUrl}/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response
  } catch (error) {
    throw error;
  }
}

export { loginUser };


async function registerUser({ name, email, password }) {
  return await axios.post(`${backendUrl}/users`, { name, email, password })
    .catch(error => {
      throw error;

    });
}

export { registerUser };

function createBlog({ title, tagline, about }) {
  return axios.post(`${backendUrl}/blogs`, { title, tagline, about })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

export { createBlog };

