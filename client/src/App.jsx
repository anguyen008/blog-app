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
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import {Routes, Route} from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {


  return (
    <AuthProvider>
      <div className="app-root">
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/sign-up" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path = "/blog/:blogId/posts/editor/:postId" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/blog/:blogId/posts/editor" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
      </Routes>
      </div>
    </AuthProvider>
  );
}
