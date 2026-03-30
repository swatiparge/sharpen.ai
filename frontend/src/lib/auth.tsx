'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    credits_balance: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const savedToken = localStorage.getItem('sharpen_token');
        const savedUser = localStorage.getItem('sharpen_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (user: User, token: string) => {
        setUser(user);
        setToken(token);
        localStorage.setItem('sharpen_token', token);
        localStorage.setItem('sharpen_user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('sharpen_token');
        localStorage.removeItem('sharpen_user');
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem('sharpen_user', JSON.stringify(data.user));
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };

    const value = useMemo(() => ({
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser
    }), [user, token, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
