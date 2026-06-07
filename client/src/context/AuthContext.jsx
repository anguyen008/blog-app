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
import {registerUser, loginUser} from "../api/api"
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token){
            localStorage.setItem("token", token);
        }
        else
            localStorage.removeItem("token", token)
    }, [token]);

    const register = async (name, email, password)=> {
        await registerUser(name, email, password);
        login(email, password);

       
        
    };

    const login = async (email, password ) => {
        const response = await loginUser(email, password);
        const token =  response.data.access_token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`        
        localStorage.setItem("token", token);
        setToken(token);

    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    }
    return(
        
        <AuthContext.Provider value={{token, register, login, logout}}>
        {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext)