"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface RegisterData {
    username: string;
    name: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { value: token, set: setToken, clear: clearToken } = useLocalStorage<string>("token", "");
    const router = useRouter();
    const pathname = usePathname();
    const apiService = useApi();

    // Update API service with current user ID whenever user changes
    useEffect(() => {
        if (user && user.id) {
            apiService.setCurrentUserId(user.id);
        } else {
            apiService.setCurrentUserId(null);
        }
    }, [apiService, user]);

    const fetchCurrentUser = async () => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            // In a real app, you would have a /me endpoint or similar
            // Here we're using the /users endpoint and assuming the first user is the current user
            const users = await apiService.get<User[]>("/users");
            if (users && users.length > 0) {
                setUser(users[0]);
            } else {
                clearToken();
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch current user:", error);
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Initialize on mount
    useEffect(() => {
        fetchCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Re-run when token changes

    // Check for protected routes
    useEffect(() => {
        const protectedRoutes = ['/users', '/users/'];
        const isProtectedRoute = protectedRoutes.some(route =>
            pathname === route || pathname?.startsWith('/users/')
        );

        if (!loading && !token && isProtectedRoute) {
            router.push('/login');
        }
    }, [pathname, token, loading, router]);

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            const response = await apiService.post<User>("/login", { username, password });
            if (response.token) {
                setToken(response.token);
                setUser(response);
                router.push("/users");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setLoading(true);
        try {
            const response = await apiService.post<User>("/users", userData);
            if (response.token) {
                setToken(response.token);
                setUser(response);
                router.push("/users");
            }
        } catch (error) {
            console.error("Registration error:", error);
            // 向上传递错误，让组件处理
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // If you have a logout API endpoint
            if (user?.id) {
                await apiService.post(`/logout/${user.id}`, {});
            }
            clearToken();
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if logout fails on server, clear local state
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        return fetchCurrentUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                register,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};