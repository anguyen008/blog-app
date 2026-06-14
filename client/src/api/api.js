// api/api.js
// ─────────────────────────────────────────────
// API utility functions for frontend to interact with backend
// Includes user registration, login, and data fetching
// Note: In a production app, you would want to handle authentication tokens,
// error handling, and other API interactions more robustly.
// ─────────────────────────────────────────────
import axios from 'axios';

// Base URL for backend API (env variable or hardcoded for development)
const backendUrl = 'http://localhost:8000';


export async function loginUser({ email, password }) {
  const formData = new URLSearchParams({ username: email, password })
  try {
    const response = await axios.post(`${backendUrl}/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
    });
    return response.data
  } catch (error) {
    throw error;
  }
}


export async function registerUser({ name, email, password }) {
  try {
    const response = await axios.post(`${backendUrl}/users`, { name, email, password })
    return response.data
  } catch (error) {
    throw error;
  };
}

export async function refresh() {
  const isLoggedIn = document.cookie.includes("is_logged_in=false")
  if (!isLoggedIn) return null
  try {
    const response = await axios.post(`${backendUrl}/refresh`, {}, { withCredentials: true })
    return response.data
  }
  catch (error) {
    return null
  }

}

export async function userLogout() {
  const response = await axios.post(`${backendUrl}/logout`, {}, { withCredentials: true })
    .catch(error => {
      throw error
    });
  return response.data
}



export async function getUserId() {
  const response = await axios.get(`${backendUrl}/verify-user`, {
  })
    .catch(error => {
      throw error
    });
  return response.data
};

export async function getUserInfo(userid) {
  const response = await axios.get(`${backendUrl}/users/${userid}`)
    .catch(error => {
      throw error
    })
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
  const response = await axios.post(`${backendUrl}/blogs`, {
    title, tagline, about,
  })
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function deleteBlog(blog_id) {
  const response = await axios.delete(`${backendUrl}/blogs/${blog_id}`, {
  })
    .catch(error => {
      throw error;
    });
  return response
}

export async function updateBlog(blog_id, { title, tagline, about }) {
  const response = await axios.put(`${backendUrl}/blogs/${blog_id}`, { title, tagline, about }, {
  })
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function getBlogPosts(blog_id) {
  const response = await axios.get(`${backendUrl}/blogs/${blog_id}/posts`)
    .catch(error => {
      throw error;
    });
  console.log(response.data)
  return response.data

}



export async function createPost({ blog_id, title, content, published }) {
  const response = await axios.post(`${backendUrl}/posts/`, { blog_id, title, content, published }, {

  })
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function updatePost(post_id, { title, content, published }) {
  const response = await axios.put(`${backendUrl}/posts/${post_id}`, { title, content, published }, {

  })
    .catch(error => {
      throw error;
    });
}

export async function getPost(post_id) {
  const response = await axios.get(`${backendUrl}/posts/${post_id}`)
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function deletePost(post_id) {
  const response = await axios.delete(`${backendUrl}/posts/${post_id}`, {})
    .catch(error => {
      throw error;
    });
  return response
}


export async function updateProfile(user_id, profile) {
  const response = await axios.patch(
    `${backendUrl}/users/${user_id}/profile`,
    { email: profile.email, name: profile.name }
  )
    .catch(error => {
      throw error;
    });
  return response.data
}


export async function changePassword(user_id, passwords) {
  const response = await axios.patch(`${backendUrl}/users/${user_id}/password`, { old_password: passwords.current, new_password: passwords.next })
    .catch(error => {
      throw error;
    });
  return response.status
}


export async function deleteUser(user_id) {
  const response = await axios.delete(`${backendUrl}/users/${user_id}`, {
  })
    .catch(error => {
      throw error;
    });
  return response.status
}
