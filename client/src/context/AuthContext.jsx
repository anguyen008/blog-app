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

import { createContext, useContext } from "react";

// Create the authentication context
const AuthContext = createContext(null);
export default AuthContext;

/**
 * useAuth - Hook to access authentication context
 * @returns {object} Auth context with user, login, logout, navigate, etc.
 */
export function useAuth() { return useContext(AuthContext); }
