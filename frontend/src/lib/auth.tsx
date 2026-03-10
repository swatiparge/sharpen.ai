'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const savedToken = localStorage.getItem('swadhyaya_token');
        const savedUser = localStorage.getItem('swadhyaya_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (user: User, token: string) => {
        setUser(user);
        setToken(token);
        localStorage.setItem('swadhyaya_token', token);
        localStorage.setItem('swadhyaya_user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('swadhyaya_token');
        localStorage.removeItem('swadhyaya_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
