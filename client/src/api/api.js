// api/api.js
// ─────────────────────────────────────────────
// All functions mirror a REST backend.
// Replace the mock implementations with real
// fetch() calls to your API endpoints.
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
  return axios.post(`${backendUrl}/login`, { email, password })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}
export { login };