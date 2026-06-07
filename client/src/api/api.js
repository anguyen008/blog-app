// api/api.js
// ─────────────────────────────────────────────
// API utility functions for frontend to interact with backend
// Includes user registration, login, and data fetching
// Note: In a production app, you would want to handle authentication tokens,
// error handling, and other API interactions more robustly.
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
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

function register({ name, email, password }) {
  return axios.post(`${backendUrl}/users`, { name, email, password })
    .then(response => response.data)
    .catch(error => {
      throw error;

    });
}
export { register };

function login({ email, password }) {
  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);
  console.log("Logging in with data:", data);
  return axios.post(`${backendUrl}/login`, data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}
export { login };