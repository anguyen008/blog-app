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
import {registerUser, loginUser, getUserId, getUserInfo, refresh, userLogout} from "../api/api"
import axios from "axios";

const AuthContext = createContext();

let accessToken = null;

const setAccessToken = (token) => {
    if (token) {
        accessToken = token
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        accessToken = null
        delete axios.defaults.headers.common["Authorization"];
    }
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const refreshAccessToken = async () => {
        const response = await refresh()
        if(!response) {return null}
        try {
            setAccessToken(response.access_token)
            return response.access_token
        } catch {
            accessToken = null;
            setAccessToken(null);
            return null;  
        }
    };

    async function restoreUser(){
        const token = await refreshAccessToken();
        if (!token) {
            setLoading(false)
            return;
        }
        try{
            const response  = await getUserId(); // this verifies the token
            const getUser = await getUserInfo(response.user_id)
            setUser(getUser);
            
        } catch(error) {
            setAccessToken(null)
            setUser(null);
        }
        finally{
            setLoading(false)
        }            
    };

    useEffect(() => {
        restoreUser();
    }, []);


    const register = async ({name, email, password})=> {
        await registerUser({name, email, password});
        await login(email, password) 
        
    };

    const login = async (email, password ) => {
        const response = await loginUser({email, password});
        accessToken =  response.access_token;
        setAccessToken(accessToken)
        const userId = await getUserId()
        const getUser = await getUserInfo(userId.user_id)
        setUser(getUser)

    }

    const logout = async () => {
        const response = await userLogout()
        console.log(response)
        setAccessToken(null);
        setUser(null)
        
    }
    return(
        
        <AuthContext.Provider value={{user, restoreUser, accessToken, loading, register, login, logout}}>
        {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext)