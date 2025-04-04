"use client"

import Loader from "../components/Loader";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';

interface AppProviderType {
    isLoading: boolean,
    authToken: string | null,
    isAdmin: boolean, // Add isAdmin property
    login: (email: string, password: string) => Promise<void>,
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>,
    logout: () => void
}

const AppContext = createContext<AppProviderType | undefined>(undefined);

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const AppProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // State to track if the user is an admin
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            setAuthToken(token);
            fetchUserRole(token); // Fetch user role to determine if they are an admin
        } else if (window.location.pathname !== '/auth') {
            router.push('/');
        }
        setIsLoading(false);
    }, [router]);

    const fetchUserRole = async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsAdmin(response.data.is_admin); // Use the is_admin field from the response
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            if (response.data.status) {
                Cookies.set('authToken', response.data.token, { expires: 7 });
                toast.success('Login successful');
                setAuthToken(response.data.token);
                fetchUserRole(response.data.token); // Fetch user role after login
                router.push("/map");
            } else {
                toast.error('Invalid login details');
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, password_confirmation: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
                password_confirmation
            });
            toast.success(response.data.message);
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        Cookies.remove('authToken');
        setAuthToken(null);
        setIsAdmin(false); // Reset isAdmin state
        setIsLoading(false);
        toast.success('Logout successful');
        router.push('/auth');
    };

    return (
        <AppContext.Provider value={{ login, register, isLoading, authToken, isAdmin, logout }}>
            {isLoading ? <Loader /> : children}
        </AppContext.Provider>
    );
};

export const myAppHook = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};