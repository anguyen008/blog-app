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
import {registerUser, loginUser, getUserId, getUserInfo} from "../api/api"
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

useEffect(() => {
    const restoreUser = async () => {
        if (!token) {
            setLoading(false)
            return;
        }
        try {
            const response  = await getUserId(token); // this verifies the token
            const getUser = await getUserInfo(response.user_id)
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
            setUser(getUser);
            
        } catch(error) {
            //  if token is invalid, expired, or tampered this runs
            sessionStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
        finally{
            setLoading(false)
        }
    };
    restoreUser();

}, []);


    const register = async ({name, email, password})=> {
        await registerUser({name, email, password});
        await login(email, password) 
        
    };

    const login = async (email, password ) => {
        const response = await loginUser({email, password});
        const token =  response.access_token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`        
        sessionStorage.setItem("token", token);
        setToken(token);
        const userid = await getUserId(token)
        const getUser = await getUserInfo(userid.user_id)
        setUser(getUser)

    }

    const logout = () => {
        sessionStorage.removeItem("token");
        setToken(null);
        
    }
    return(
        
        <AuthContext.Provider value={{user, token, loading, register, login, logout}}>
        {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext)