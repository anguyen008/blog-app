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
import UserSettingsPanel from "./pages/UserSettings";

export default function App() {


  return (
    <AuthProvider>
      <div className="app-root">
        <Routes>
         <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/sign-up" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path = "/dashboard/blog/:blogId/posts/editor/:postId" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/dashboard/blog/:blogId/posts/editor" element={<ProtectedRoute><EditorPage/></ProtectedRoute>}/>
        <Route path = "/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
        <Route path = "/user/settings" element={<ProtectedRoute><UserSettingsPanel/></ProtectedRoute>}/>
      </Routes>
      </div>
    </AuthProvider>
  );
}
