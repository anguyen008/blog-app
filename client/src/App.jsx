/**
 * App.jsx - Main Application Component
 * 
 * Serves as the root component of the Ink Blog application. Manages:
 * - User authentication state (login/logout)
 * - Page routing and navigation
 * - Navigation parameters passing
 * - Authentication context provider
 */

import { useState } from "react";
import {AuthProvider, useAuth} from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPage from "./pages/SetupPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import {Routes, Route} from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  // Track currently logged-in user
  const [user, setUser] = useState(null);
  // Track active page/route
  const [page, setPage] = useState("/")
  // Store route parameters (e.g., blogId, postId)
  const [pageParams, setPageParams] = useState({});

  /**
   * Handle user login - set user data and route appropriately
   * New users without a blog go to setup; existing users go to dashboard
   */
  function login(userData) {
    setUser(userData);
    if (!userData.blog) {
      navigate("setup");
      
    }
    // Route new users to blog setup, existing users to dashboard
    else
      navigate("dashboard");
  }

  /**
   * Handle user logout - clear user state and return to login
   */
  function logout() {
    setUser(null);
    navigate("login");
  }

  return (
    <AuthProvider>
      <div className="app-root">
        <Routes>
        <Route path = "/" element={<LoginPage/>}/>
        <Route path = "/login" element={<LoginPage/>}/>
        <Route path = "/sign-up" element={<RegisterPage/>}/>
        <Route path = "/setup-blog" element={<SetupPage/>}/>
        <Route path = "/dashboard/blog/:blogId/posts/editor/:postId" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/dashboard/blog/:blogId/posts/editor" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>

      </Routes>
      </div>
    </AuthProvider>
  );
}
