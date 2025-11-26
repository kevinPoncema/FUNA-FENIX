/**
 * Servicio de API simplificado para comunicarse con el backend Laravel
 */

const API_BASE_URL = 'http://localhost:8000/api';

class APIService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
    }

    // Configuración de headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Método base para hacer requests
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Si el token expiró, limpiar sesión
                if (response.status === 401 && this.token) {
                    this.clearAuth();
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || data.error || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Limpiar datos de autenticación
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // Métodos de autenticación
    async loginAsGuest(name = null) {
        const body = {};
        if (name) body.name = name;
        
        const data = await this.request('/auth/login-guest', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return data;
    }

    async loginAsAdmin(email, password) {
        const data = await this.request('/auth/login-admin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } finally {
            this.clearAuth();
        }
    }

    // Métodos para Team Members
    async getTeamMembers() {
        return await this.request('/team-members');
    }

    async getTeamMembersWithFeedbacks() {
        return await this.request('/team-members-with-feedbacks');
    }

    async createTeamMember(name, role) {
        return await this.request('/team-members', {
            method: 'POST',
            body: JSON.stringify({ name, role }),
        });
    }

    async updateTeamMember(id, name, role) {
        return await this.request(`/team-members/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, role }),
        });
    }

    async deleteTeamMember(id) {
        return await this.request(`/team-members/${id}`, {
            method: 'DELETE',
        });
    }

    // Métodos para Feedback
    async getFeedbacks() {
        return await this.request('/feedbacks');
    }

    async createFeedback(targetId, category, title, text) {
        return await this.request('/feedbacks', {
            method: 'POST',
            body: JSON.stringify({
                target_id: targetId,
                category,
                title,
                text,
            }),
        });
    }

    async updateFeedback(id, targetId, category, title, text) {
        return await this.request(`/feedbacks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                target_id: targetId,
                category,
                title,
                text,
            }),
        });
    }

    async deleteFeedback(id) {
        return await this.request(`/feedbacks/${id}`, {
            method: 'DELETE',
        });
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Verificar si es admin
    isAdmin() {
        return this.user?.role === 'admin' || this.user?.role === 'administrator';
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.user;
    }
}

// Instancia singleton
export const apiService = new APIService();
export default apiService;