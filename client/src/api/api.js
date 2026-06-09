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

export async function loginUser({ email, password }) {
  const formData = new URLSearchParams({ username: email, password })

  try {
    const response = await axios.post(`${backendUrl}/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true
    });
    return response.data
  } catch (error) {
    throw error;
  }
}


export async function registerUser({ name, email, password }) {
  return await axios.post(`${backendUrl}/users`, { name, email, password }).data
    .catch(error => {
      throw error;

    });
}


export async function getUserId(token) {
  const response = await axios.get(`${backendUrl}/verify-user`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return response.data
};

export async function getUserInfo(userid) {
  const response = await axios.get(`${backendUrl}/users/${userid}`)
  return response.data
}


export async function getUserBlogs(userid) {
  const response = await axios.get(`${backendUrl}/blogs/${userid}`)
    .catch(error => {
      throw error;
    });
  return response.data
}

export async function createBlog({ title, tagline, about }) {
  const response = await axios.post(`${backendUrl}/blogs`, { title, tagline, about })
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function deleteBlog(blog_id) {
  const response = await axios.delete(`${backendUrl}/blogs/${blog_id}`, {
    withCredentials: true
  })
    .catch(error => {
      throw error;
    });
  return response.data
}

export async function updateBlog(blog_id, { title, tagline, about }) {
  const response = await axios.put(`${backendUrl}/blogs/${blog_id}`, { title, tagline, about }, {
    withCredentials: true
  })
    .catch(error => {
      throw error;
    });
  return response.data
}




export async function getBlogPosts(blog_id) {
  const response = await axios.get(`${backendUrl}/${blog_id}`)
  return response.data

}

