/**
 * AuthContext.jsx - Authentication Context
 *
 * Provides authentication state and methods globally to all components:
 * - user: Current logged-in user object
 * - setUser: Update user state
 * - login: Handle user login
 * - logout: Handle user logout
 * - navigate: Navigate to different pages
 * - pageParams: Route parameters
 */

import { createContext, useState, useEffect, useContext } from "react";
import {
  registerUser,
  loginUser,
  getUserId,
  getUserInfo,
  refresh,
  userLogout,
  api,
} from "../api/api";
import axios from "axios";

const AuthContext = createContext();

let accessToken = null;

const setAccessToken = (token) => {
  if (token) {
    accessToken = token;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    accessToken = null;
    delete api.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = async () => {
    const response = await refresh();
    if (!response) {
      return null;
    }
    try {
      setAccessToken(response.access_token);
      return response.access_token;
    } catch {
      accessToken = null;
      setAccessToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  async function restoreUser() {
    const token = await refreshAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await getUserId(); // this verifies the token
      const getUser = await getUserInfo(response.user_id);
      setUser(getUser);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              const response = await getUserId();
              const getUser = await getUserInfo(response.user_id);
              setUser(getUser);
              processQueue(null, newToken);
              return api(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            console.error("Token refresh failed:", refreshError);
            accessToken = null;
            logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        return Promise.reject(error);
      },
    );
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  useEffect(() => {
    restoreUser();
  }, []);

  const register = async ({ name, email, password }) => {
    await registerUser({ name, email, password });
    await login(email, password);
  };

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    accessToken = response.access_token;
    setAccessToken(accessToken);
    const userId = await getUserId();
    const getUser = await getUserInfo(userId.user_id);
    setUser(getUser);
  };

  const logout = async () => {
    const response = await userLogout();
    setAccessToken(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        restoreUser,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
