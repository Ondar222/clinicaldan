import type { User, LoginData, RegisterData, AuthResponse } from '../types/cms';

// Backend API configuration
// В production используем HTTPS по умолчанию, если переменная окружения не задана
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || (import.meta.env.PROD ? 'https://clinicaldan.ru/api' : 'http://localhost:5002/api');
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = BACKEND_API_URL;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Token management
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    removeToken(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    }

    // User data management
    getUser(): User | null {
        if (typeof window === 'undefined') return null;
        try {
            const userData = localStorage.getItem(USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    setUser(user: User): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }

    // Authentication methods
    async login(loginData: LoginData): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
        });

        this.setToken(response.token);
        this.setUser(response.user);
        return response;
    }

    async register(registerData: RegisterData): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerData),
        });

        this.setToken(response.token);
        this.setUser(response.user);
        return response;
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.removeToken();
        }
    }

    async refreshToken(): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/refresh', {
            method: 'POST',
        });

        this.setToken(response.token);
        this.setUser(response.user);
        return response;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    // Get current user
    getCurrentUser(): User | null {
        if (!this.isAuthenticated()) return null;
        return this.getUser();
    }

    // Check if user has specific role
    hasRole(role: 'patient' | 'staff'): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    // Update user profile
    async updateProfile(userData: Partial<User>): Promise<User> {
        const response = await this.request<User>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });

        this.setUser(response);
        return response;
    }

    // Change password
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        });
    }

    // Reset password
    async resetPassword(email: string): Promise<void> {
        await this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Verify email
    async verifyEmail(token: string): Promise<void> {
        await this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }
}

export const authService = new AuthService();
export default authService;
