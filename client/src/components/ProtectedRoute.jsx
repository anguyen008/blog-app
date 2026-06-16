
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./UI";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();


    if(loading)
        return <div className="page-loading"><Spinner></Spinner> </div>

    if (!user) {
        return <Navigate to="/login" replace />;  // redirects if not logged in
    }
    
    return children;
    }