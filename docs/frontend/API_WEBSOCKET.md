# 🌐 API & WebSocket Client - FUNA FENIX Frontend

## Descripción General

El frontend de FUNA FENIX utiliza un sistema robusto de comunicación HTTP y WebSocket para interactuar con el backend. Incluye un cliente HTTP personalizado, configuración de Laravel Echo para tiempo real, y manejo de estados de conexión y errores.

## Arquitectura de Comunicación

```
Frontend Components
        ↓
    useAPI Hook
        ↓
┌─────────────────┬─────────────────┐
│   apiService    │   echo.js       │
│   (HTTP)        │   (WebSocket)   │
└─────────────────┴─────────────────┘
        ↓                 ↓
    Laravel API       Soketi Server
        ↓                 ↓
    MySQL Database    Broadcasting
```

## HTTP Client (apiService.js)

### Configuración Base

```javascript
/**
 * Servicio de API simplificado para comunicarse con el backend Laravel
 */

const API_BASE_URL = 'http://localhost:8000/api';

class APIService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        
        // Request interceptors para manejo global
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    // ===== CONFIGURACIÓN DE HEADERS =====
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // Para Laravel CSRF
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // ===== MÉTODO BASE PARA REQUESTS =====
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        // Aplicar request interceptors
        for (const interceptor of this.requestInterceptors) {
            await interceptor(config);
        }

        try {
            console.log(`🔄 ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            // Verificar content-type antes de parsear JSON
            const contentType = response.headers.get('content-type');
            let data = null;
            
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text.trim()) {
                    try {
                        data = JSON.parse(text);
                    } catch (jsonError) {
                        console.error('❌ Invalid JSON response:', text);
                        throw new Error('Invalid server response format');
                    }
                }
            }

            // Aplicar response interceptors
            for (const interceptor of this.responseInterceptors) {
                data = await interceptor(response, data);
            }

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
                console.error(`❌ API Error:`, {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url
                });

                // Manejar errores específicos
                if (response.status === 401) {
                    this.handleUnauthorized();
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }

                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acción.');
                }

                if (response.status === 422 && data?.errors) {
                    // Errores de validación de Laravel
                    const validationErrors = Object.values(data.errors).flat().join(', ');
                    throw new Error(validationErrors);
                }

                if (response.status >= 500) {
                    throw new Error('Error interno del servidor. Por favor, intenta más tarde.');
                }

                throw new Error(errorMessage);
            }

            console.log(`✅ Success:`, data);
            return data;

        } catch (error) {
            // Manejar errores de red
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('❌ Network error:', error);
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }

            console.error('❌ Request failed:', error);
            throw error;
        }
    }

    // ===== MANEJO DE AUTORIZACIÓN =====
    handleUnauthorized() {
        console.warn('🔒 Unauthorized access detected, clearing auth data');
        this.clearAuth();
        
        // Opcional: redirigir al login o emitir evento
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // ===== INTERCEPTORS =====
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }
}
```

### Métodos de Autenticación

```javascript
class APIService {
    // ... configuración base

    // ===== AUTENTICACIÓN =====
    async loginAdmin(email, password) {
        const data = await this.request('/auth/login-admin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        console.log('✅ Admin login successful:', data.user);
        return data;
    }

    async loginGuest(name = null, hash = null) {
        const guestData = {};
        if (name) guestData.name = name;
        if (hash) guestData.hash = hash;

        const data = await this.request('/auth/login-guest', {
            method: 'POST',
            body: JSON.stringify(guestData),
        });

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        console.log('✅ Guest login successful:', data.user);
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
            console.log('✅ Logout successful');
        } catch (error) {
            console.warn('⚠️ Logout request failed:', error.message);
            // Continuar con logout local incluso si falla la request
        } finally {
            this.clearAuth();
        }
    }

    async getCurrentUser() {
        try {
            const user = await this.request('/user');
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('❌ Failed to get current user:', error);
            throw error;
        }
    }
}
```

### Métodos de Team Members

```javascript
class APIService {
    // ... métodos anteriores

    // ===== TEAM MEMBERS =====
    async getTeamMembers() {
        try {
            return await this.request('/team-members');
        } catch (error) {
            console.error('❌ Error fetching team members:', error);
            throw error;
        }
    }

    async getTeamMembersWithFeedbacks() {
        try {
            const data = await this.request('/team-members-with-feedbacks');
            console.log('📊 Team members with feedbacks loaded:', data.length, 'members');
            return data;
        } catch (error) {
            console.error('❌ Error fetching team members with feedbacks:', error);
            throw error;
        }
    }

    async createTeamMember(name, role) {
        try {
            const result = await this.request('/team-members', {
                method: 'POST',
                body: JSON.stringify({ name, role }),
            });
            
            console.log('✅ Team member created:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating team member:', error);
            throw error;
        }
    }

    async updateTeamMember(id, name, role) {
        try {
            const result = await this.request(`/team-members/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, role }),
            });
            
            console.log('✅ Team member updated:', result);
            return result;
        } catch (error) {
            console.error('❌ Error updating team member:', error);
            throw error;
        }
    }

    async deleteTeamMember(id) {
        try {
            await this.request(`/team-members/${id}`, {
                method: 'DELETE',
            });
            
            console.log('✅ Team member deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting team member:', error);
            throw error;
        }
    }
}
```

### Métodos de Feedbacks

```javascript
class APIService {
    // ... métodos anteriores

    // ===== FEEDBACKS =====
    async getFeedbacks() {
        try {
            return await this.request('/feedbacks');
        } catch (error) {
            console.error('❌ Error fetching feedbacks:', error);
            throw error;
        }
    }

    async createFeedback(feedbackData) {
        try {
            const result = await this.request('/feedbacks', {
                method: 'POST',
                body: JSON.stringify(feedbackData),
            });
            
            console.log('✅ Feedback created:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating feedback:', error);
            throw error;
        }
    }

    async updateFeedback(id, feedbackData) {
        try {
            const result = await this.request(`/feedbacks/${id}`, {
                method: 'PUT',
                body: JSON.stringify(feedbackData),
            });
            
            console.log('✅ Feedback updated:', result);
            return result;
        } catch (error) {
            console.error('❌ Error updating feedback:', error);
            throw error;
        }
    }

    async deleteFeedback(id) {
        try {
            await this.request(`/feedbacks/${id}`, {
                method: 'DELETE',
            });
            
            console.log('✅ Feedback deleted:', id);
        } catch (error) {
            console.error('❌ Error deleting feedback:', error);
            throw error;
        }
    }

    async getFeedbackById(id) {
        try {
            return await this.request(`/feedbacks/${id}`);
        } catch (error) {
            console.error(`❌ Error fetching feedback ${id}:`, error);
            throw error;
        }
    }
}
```

### Instancia Singleton

```javascript
// Crear instancia singleton del servicio
const apiService = new APIService();

// Añadir interceptors globales
apiService.addRequestInterceptor(async (config) => {
    // Ejemplo: logging de requests
    console.log('🚀 Request interceptor:', config);
});

apiService.addResponseInterceptor(async (response, data) => {
    // Ejemplo: logging de responses
    console.log('📥 Response interceptor:', response.status, data);
    return data;
});

export default apiService;
```

## WebSocket Client (echo.js)

### Configuración de Laravel Echo

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher globalmente
window.Pusher = Pusher;

// ===== CONFIGURACIÓN DE ECHO =====
const echo = new Echo({
    broadcaster: 'pusher',
    key: 'local-key',                    // Debe coincidir con PUSHER_APP_KEY
    wsHost: 'localhost',                 // Host de Soketi
    wsPort: 6001,                        // Puerto de Soketi
    wssPort: 6001,                       // Puerto SSL (mismo para desarrollo)
    forceTLS: false,                     // Sin TLS en desarrollo
    encrypted: false,                    // Sin encriptación en desarrollo
    disableStats: true,                  // Deshabilitar estadísticas
    enabledTransports: ['ws', 'wss'],    // Transportes permitidos
    
    // Configuraciones adicionales
    cluster: null,                       // Sin cluster para Soketi
    enableLogging: true,                 // Habilitar logs en desarrollo
    logToConsole: true,
    
    // Configuración de autenticación para canales privados
    auth: {
        headers: {
            // Se añadirá dinámicamente cuando se tenga el token
        }
    },
    
    // Configuración de reconexión
    activityTimeout: 30000,              // 30 segundos
    pongTimeout: 6000,                   // 6 segundos
    unavailableTimeout: 10000,           // 10 segundos
});

// ===== MANEJO DE EVENTOS DE CONEXIÓN =====
echo.connector.pusher.connection.bind('connected', () => {
    console.log('🔗 WebSocket connected successfully');
    
    // Emitir evento personalizado para la aplicación
    window.dispatchEvent(new CustomEvent('websocket:connected'));
});

echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('🔌 WebSocket disconnected');
    
    // Emitir evento personalizado para la aplicación
    window.dispatchEvent(new CustomEvent('websocket:disconnected'));
});

echo.connector.pusher.connection.bind('error', (error) => {
    console.error('❌ WebSocket error:', error);
    
    // Emitir evento personalizado con el error
    window.dispatchEvent(new CustomEvent('websocket:error', { detail: error }));
});

echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('🔄 WebSocket state change:', states.previous, '->', states.current);
    
    // Emitir evento personalizado con los estados
    window.dispatchEvent(new CustomEvent('websocket:state_change', { 
        detail: { previous: states.previous, current: states.current }
    }));
});

// ===== MÉTODOS DE UTILIDAD =====

/**
 * Configurar autenticación para canales privados
 */
echo.setAuthToken = (token) => {
    echo.connector.pusher.config.auth = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    console.log('🔐 WebSocket auth token configured');
};

/**
 * Obtener estado de la conexión
 */
echo.getConnectionState = () => {
    return echo.connector.pusher.connection.state;
};

/**
 * Reconectar manualmente
 */
echo.reconnect = () => {
    echo.connector.pusher.disconnect();
    echo.connector.pusher.connect();
    console.log('🔄 WebSocket reconnection initiated');
};

/**
 * Limpiar todas las suscripciones
 */
echo.clearSubscriptions = () => {
    Object.keys(echo.connector.channels).forEach(channelName => {
        echo.leave(channelName);
    });
    console.log('🧹 All WebSocket subscriptions cleared');
};

export default echo;
```

### Constants (constants.js)

```javascript
/**
 * Constantes para la configuración de API y WebSocket
 */

// ===== API CONFIGURATION =====
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api',
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 segundo
};

// ===== WEBSOCKET CONFIGURATION =====
export const WEBSOCKET_CONFIG = {
    HOST: 'localhost',
    PORT: 6001,
    SSL_PORT: 6001,
    APP_KEY: 'local-key',
    CLUSTER: null,
    FORCE_TLS: false,
    ENCRYPTED: false,
};

// ===== CHANNELS =====
export const CHANNELS = {
    FEEDBACK_UPDATES: 'feedback-updates',
    TEAM_UPDATES: 'team-updates',
    USER_NOTIFICATIONS: 'user-notifications', // Para futuro uso
};

// ===== EVENTS =====
export const EVENTS = {
    // Feedback events
    FEEDBACK_CREATED: 'feedback.created',
    FEEDBACK_UPDATED: 'feedback.updated',
    FEEDBACK_DELETED: 'feedback.deleted',
    
    // Team member events
    TEAM_MEMBER_CREATED: 'team-member.created',
    TEAM_MEMBER_UPDATED: 'team-member.updated',
    TEAM_MEMBER_DELETED: 'team-member.deleted',
    
    // Connection events
    WEBSOCKET_CONNECTED: 'websocket:connected',
    WEBSOCKET_DISCONNECTED: 'websocket:disconnected',
    WEBSOCKET_ERROR: 'websocket:error',
    WEBSOCKET_STATE_CHANGE: 'websocket:state_change',
};

// ===== FEEDBACK CATEGORIES =====
export const FEEDBACK_CATEGORIES = [
    {
        id: 'achievements',
        name: 'Logros',
        description: 'Reconocimientos por logros y éxitos',
        icon: '👍',
        color: 'bg-green-200'
    },
    {
        id: 'qualities',
        name: 'Cualidades',
        description: 'Cualidades personales y profesionales',
        icon: '👤',
        color: 'bg-blue-200'
    },
    {
        id: 'potential',
        name: 'Potencial',
        description: 'Áreas de crecimiento y potencial',
        icon: '📈',
        color: 'bg-purple-200'
    }
];

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    SERVER_ERROR: 'Error interno del servidor. Por favor, intenta más tarde.',
    VALIDATION_ERROR: 'Los datos enviados no son válidos.',
    WEBSOCKET_ERROR: 'Error en la conexión en tiempo real.',
};

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
    FEEDBACK_CREATED: 'Feedback creado exitosamente',
    FEEDBACK_UPDATED: 'Feedback actualizado exitosamente',
    FEEDBACK_DELETED: 'Feedback eliminado exitosamente',
    TEAM_MEMBER_CREATED: 'Miembro del equipo creado exitosamente',
    TEAM_MEMBER_UPDATED: 'Miembro del equipo actualizado exitosamente',
    TEAM_MEMBER_DELETED: 'Miembro del equipo eliminado exitosamente',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
};

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
    LOADING_DELAY: 300, // Delay antes de mostrar spinner
    NOTIFICATION_DURATION: 3000, // Duración de notificaciones
    MODAL_ANIMATION_DURATION: 200, // Duración de animaciones de modal
    WEBSOCKET_ANIMATION_DURATION: 2000, // Duración de animaciones WebSocket
};
```

## Hook Personalizado (useAPI.js)

### Estructura Principal

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from './apiService.js';
import echo from './echo.js';
import { CHANNELS, EVENTS } from './constants.js';

export const useAPI = () => {
    // ===== ESTADO INTERNO =====
    const [isInitialized, setIsInitialized] = useState(false);
    const [connectionState, setConnectionState] = useState('disconnected');
    const [lastError, setLastError] = useState(null);
    
    // Referencias para callbacks
    const callbacksRef = useRef({
        onFeedbackCreated: null,
        onFeedbackUpdated: null,
        onFeedbackDeleted: null,
        onTeamMemberCreated: null,
        onTeamMemberUpdated: null,
        onTeamMemberDeleted: null,
    });

    // ===== FUNCIONES DE AUTENTICACIÓN =====
    const login = useCallback(async (credentials, mode = 'admin') => {
        try {
            setLastError(null);
            
            let result;
            if (mode === 'admin') {
                result = await apiService.loginAdmin(credentials.email, credentials.password);
            } else {
                result = await apiService.loginGuest(credentials.name, credentials.hash);
            }
            
            // Configurar token para WebSocket
            if (result.token) {
                echo.setAuthToken(result.token);
            }
            
            return {
                success: true,
                user: result.user,
                token: result.token
            };
        } catch (error) {
            setLastError(error.message);
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Error de autenticación'
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiService.logout();
            echo.clearSubscriptions();
            setIsInitialized(false);
            setConnectionState('disconnected');
            setLastError(null);
        } catch (error) {
            console.error('Logout error:', error);
            setLastError(error.message);
        }
    }, []);

    // ===== FUNCIONES DE DATOS CON RETRY =====
    const withRetry = useCallback(async (operation, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${attempt}/${retries} failed:`, error.message);
                
                if (attempt === retries) {
                    throw error;
                }
                
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }, []);

    const fetchTeamMembersWithFeedbacks = useCallback(async () => {
        try {
            setLastError(null);
            const data = await withRetry(() => apiService.getTeamMembersWithFeedbacks());
            return { success: true, data };
        } catch (error) {
            setLastError(error.message);
            console.error('Error fetching team members:', error);
            return { success: false, error: error.message };
        }
    }, [withRetry]);

    const createFeedback = useCallback(async (feedbackData) => {
        try {
            setLastError(null);
            const feedback = await apiService.createFeedback(feedbackData);
            return { success: true, data: feedback };
        } catch (error) {
            setLastError(error.message);
            console.error('Error creating feedback:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const deleteFeedback = useCallback(async (feedbackId) => {
        try {
            setLastError(null);
            await apiService.deleteFeedback(feedbackId);
            return { success: true };
        } catch (error) {
            setLastError(error.message);
            console.error('Error deleting feedback:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // ===== CONFIGURACIÓN DE WEBSOCKET =====
    useEffect(() => {
        if (!isInitialized && apiService.token) {
            setupWebSocketListeners();
            setIsInitialized(true);
        }

        return () => {
            if (isInitialized) {
                cleanupWebSocketListeners();
            }
        };
    }, [isInitialized]);

    const setupWebSocketListeners = useCallback(() => {
        try {
            // Configurar autenticación
            echo.setAuthToken(apiService.token);

            // Escuchar eventos de conexión
            window.addEventListener('websocket:connected', handleWebSocketConnected);
            window.addEventListener('websocket:disconnected', handleWebSocketDisconnected);
            window.addEventListener('websocket:error', handleWebSocketError);

            // Suscribirse a canales
            const feedbackChannel = echo.channel(CHANNELS.FEEDBACK_UPDATES);
            const teamChannel = echo.channel(CHANNELS.TEAM_UPDATES);

            // Eventos de feedback
            feedbackChannel.listen(`.${EVENTS.FEEDBACK_CREATED}`, handleFeedbackCreated);
            feedbackChannel.listen(`.${EVENTS.FEEDBACK_UPDATED}`, handleFeedbackUpdated);
            feedbackChannel.listen(`.${EVENTS.FEEDBACK_DELETED}`, handleFeedbackDeleted);

            // Eventos de team members
            teamChannel.listen(`.${EVENTS.TEAM_MEMBER_CREATED}`, handleTeamMemberCreated);
            teamChannel.listen(`.${EVENTS.TEAM_MEMBER_UPDATED}`, handleTeamMemberUpdated);
            teamChannel.listen(`.${EVENTS.TEAM_MEMBER_DELETED}`, handleTeamMemberDeleted);

            console.log('✅ WebSocket listeners configurados');
        } catch (error) {
            console.error('❌ Error configurando WebSocket:', error);
            setLastError('Error configurando conexión en tiempo real');
        }
    }, []);

    const cleanupWebSocketListeners = useCallback(() => {
        // Remover event listeners
        window.removeEventListener('websocket:connected', handleWebSocketConnected);
        window.removeEventListener('websocket:disconnected', handleWebSocketDisconnected);
        window.removeEventListener('websocket:error', handleWebSocketError);

        // Limpiar suscripciones
        echo.clearSubscriptions();

        console.log('🧹 WebSocket listeners limpiados');
    }, []);

    // ===== HANDLERS DE WEBSOCKET =====
    const handleWebSocketConnected = useCallback(() => {
        setConnectionState('connected');
        setLastError(null);
        console.log('🔗 WebSocket connected');
    }, []);

    const handleWebSocketDisconnected = useCallback(() => {
        setConnectionState('disconnected');
        console.log('🔌 WebSocket disconnected');
    }, []);

    const handleWebSocketError = useCallback((event) => {
        setConnectionState('error');
        setLastError('Error en conexión WebSocket');
        console.error('❌ WebSocket error:', event.detail);
    }, []);

    const handleFeedbackCreated = useCallback((event) => {
        console.log('📢 Feedback created via WebSocket:', event);
        if (callbacksRef.current.onFeedbackCreated) {
            callbacksRef.current.onFeedbackCreated(event.feedback);
        }
    }, []);

    const handleFeedbackDeleted = useCallback((event) => {
        console.log('📢 Feedback deleted via WebSocket:', event);
        if (callbacksRef.current.onFeedbackDeleted) {
            callbacksRef.current.onFeedbackDeleted(event.feedbackId);
        }
    }, []);

    const handleTeamMemberCreated = useCallback((event) => {
        console.log('📢 Team member created via WebSocket:', event);
        if (callbacksRef.current.onTeamMemberCreated) {
            callbacksRef.current.onTeamMemberCreated(event.teamMember);
        }
    }, []);

    // ===== MÉTODOS PARA ESTABLECER CALLBACKS =====
    const setCallbacks = useCallback((callbacks) => {
        callbacksRef.current = { ...callbacksRef.current, ...callbacks };
    }, []);

    return {
        // Estado
        isInitialized,
        connectionState,
        lastError,
        
        // Funciones de autenticación
        login,
        logout,
        
        // Funciones de datos
        fetchTeamMembersWithFeedbacks,
        createFeedback,
        deleteFeedback,
        
        // WebSocket
        setCallbacks,
        
        // Utilidades
        reconnectWebSocket: echo.reconnect,
        getConnectionState: echo.getConnectionState,
    };
};

export default useAPI;
```

## Flujo de Datos en Tiempo Real

### 1. Flujo de Creación de Feedback

```
Usuario crea feedback → apiService.createFeedback() → Laravel API
                                                         ↓
Laravel emite evento → Soketi Server → Echo Client → handleFeedbackCreated()
                                                         ↓
                               Callback → App component → Actualiza estado
```

### 2. Flujo de Eliminación de Feedback

```
Usuario elimina → apiService.deleteFeedback() → Laravel API (con validación)
                                                     ↓
Laravel emite evento → Soketi Server → Echo Client → handleFeedbackDeleted()
                                                         ↓
                               Callback → App component → Remueve del estado
```

### 3. Manejo de Errores y Reconexión

```
Error de conexión → echo.connector.pusher.connection.bind('error')
                                                         ↓
setConnectionState('error') → UI muestra estado de error
                                                         ↓
Reconexión automática → echo.reconnect() → Restablecer suscripciones
```

## Optimizaciones y Best Practices

### 1. Request Deduplication

```javascript
class APIService {
    constructor() {
        this.pendingRequests = new Map();
    }

    async request(endpoint, options = {}) {
        const requestKey = `${options.method || 'GET'}-${endpoint}`;
        
        // Evitar requests duplicados
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const requestPromise = this._makeRequest(endpoint, options);
        this.pendingRequests.set(requestKey, requestPromise);

        try {
            const result = await requestPromise;
            return result;
        } finally {
            this.pendingRequests.delete(requestKey);
        }
    }
}
```

### 2. Connection Pooling y Cleanup

```javascript
// Cleanup al desmontar componentes
useEffect(() => {
    return () => {
        if (connectionState === 'connected') {
            echo.clearSubscriptions();
        }
    };
}, [connectionState]);
```

### 3. Error Boundary para WebSocket

```javascript
// Error boundary específico para WebSocket
class WebSocketErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('WebSocket Error Boundary caught an error:', error, errorInfo);
        
        // Intentar reconectar
        setTimeout(() => {
            echo.reconnect();
            this.setState({ hasError: false, error: null });
        }, 5000);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Conexión perdida</h2>
                    <p>Reestableciendo conexión...</p>
                </div>
            );
        }

        return this.props.children;
    }
}
```

Este sistema de comunicación proporciona una base robusta, escalable y resiliente para la comunicación en tiempo real entre frontend y backend en FUNA FENIX.
