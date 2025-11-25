import { IDataProvider } from '../interfaces/IDataProvider.js';
import { EventEmitter } from '../core/EventEmitter.js';
import { handleError } from '../utils/helpers.js';

/**
 * Proveedor de datos usando API REST
 * Plantilla lista para implementar cuando sea necesario
 */
export class ApiRestProvider extends IDataProvider {
    constructor() {
        super();
        this.eventEmitter = new EventEmitter();
        this.baseUrl = null;
        this.userId = null;
        this.authToken = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa el proveedor de API REST
     * @param {Object} config - Configuración del API
     * @param {string} config.baseUrl - URL base del API
     * @param {string} config.authToken - Token de autenticación
     * @param {number} config.timeout - Timeout para requests
     */
    async initialize(config = {}) {
        try {
            const { baseUrl, authToken, timeout = 5000 } = config;
            
            if (!baseUrl) {
                throw new Error('baseUrl es requerido para ApiRestProvider');
            }

            this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remover trailing slashes
            this.authToken = authToken;
            this.timeout = timeout;

            // TODO: Implementar verificación de conectividad con el API
            // const healthCheck = await this._makeRequest('GET', '/health');
            // if (!healthCheck.ok) throw new Error('API no disponible');

            this.isInitialized = true;
            
            return { success: true, baseUrl: this.baseUrl };
        } catch (error) {
            throw handleError(error, 'Error al inicializar ApiRestProvider');
        }
    }

    /**
     * Autentica con el API REST
     */
    async authenticate() {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar autenticación real
            // const response = await this._makeRequest('POST', '/auth/login', credentials);
            // this.authToken = response.token;
            // this.userId = response.user.id;
            
            // Por ahora, simular autenticación
            this.userId = 'api_user_' + Date.now();
            
            return {
                uid: this.userId,
                provider: 'apiRest'
            };
        } catch (error) {
            throw handleError(error, 'Error en autenticación API');
        }
    }

    /**
     * Obtiene todos los miembros del equipo
     */
    async getMembers() {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // return await this._makeRequest('GET', '/members');
            return [];
        } catch (error) {
            throw handleError(error, 'Error al obtener miembros del API');
        }
    }

    /**
     * Añade un nuevo miembro
     */
    async addMember(memberData) {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // const response = await this._makeRequest('POST', '/members', memberData);
            // this.eventEmitter.emit('membersChanged', await this.getMembers());
            // return response;
            throw new Error('ApiRestProvider no implementado completamente');
        } catch (error) {
            throw handleError(error, 'Error al añadir miembro en API');
        }
    }

    /**
     * Elimina un miembro
     */
    async deleteMember(memberId) {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // await this._makeRequest('DELETE', `/members/${memberId}`);
            // this.eventEmitter.emit('membersChanged', await this.getMembers());
            // return true;
            throw new Error('ApiRestProvider no implementado completamente');
        } catch (error) {
            throw handleError(error, 'Error al eliminar miembro en API');
        }
    }

    /**
     * Obtiene todo el feedback
     */
    async getFeedback() {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // return await this._makeRequest('GET', '/feedback');
            return [];
        } catch (error) {
            throw handleError(error, 'Error al obtener feedback del API');
        }
    }

    /**
     * Añade nuevo feedback
     */
    async addFeedback(feedbackData) {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // const response = await this._makeRequest('POST', '/feedback', feedbackData);
            // this.eventEmitter.emit('feedbackChanged', await this.getFeedback());
            // return response;
            throw new Error('ApiRestProvider no implementado completamente');
        } catch (error) {
            throw handleError(error, 'Error al añadir feedback en API');
        }
    }

    /**
     * Elimina feedback
     */
    async deleteFeedback(feedbackId) {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar request real
            // await this._makeRequest('DELETE', `/feedback/${feedbackId}`);
            // this.eventEmitter.emit('feedbackChanged', await this.getFeedback());
            // return true;
            throw new Error('ApiRestProvider no implementado completamente');
        } catch (error) {
            throw handleError(error, 'Error al eliminar feedback en API');
        }
    }

    /**
     * Suscribe a cambios de miembros
     */
    onMembersChange(callback) {
        this.eventEmitter.on('membersChanged', callback);
        
        // TODO: Implementar polling o server-sent events
        this.getMembers().then(members => callback(members));
        
        return () => this.eventEmitter.off('membersChanged', callback);
    }

    /**
     * Suscribe a cambios de feedback
     */
    onFeedbackChange(callback) {
        this.eventEmitter.on('feedbackChanged', callback);
        
        // TODO: Implementar polling o server-sent events
        this.getFeedback().then(feedback => callback(feedback));
        
        return () => this.eventEmitter.off('feedbackChanged', callback);
    }

    /**
     * Limpia todos los datos
     */
    async clearAll() {
        this._ensureInitialized();
        
        try {
            // TODO: Implementar endpoint de limpieza
            // await this._makeRequest('DELETE', '/data/clear');
            throw new Error('Operación clearAll no soportada en API REST');
        } catch (error) {
            throw handleError(error, 'Error al limpiar datos en API');
        }
    }

    /**
     * Desconecta del API
     */
    async disconnect() {
        this.eventEmitter.removeAllListeners();
        this.authToken = null;
        this.userId = null;
        this.isInitialized = false;
    }

    // Métodos privados

    /**
     * Verifica que el proveedor esté inicializado
     */
    _ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('ApiRestProvider no inicializado. Llama a initialize() primero.');
        }
    }

    /**
     * Realiza una petición HTTP al API
     * @param {string} method - Método HTTP
     * @param {string} endpoint - Endpoint del API
     * @param {Object} data - Datos para enviar
     * @returns {Promise} Respuesta del API
     */
    async _makeRequest(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
            },
            ...(data && { body: JSON.stringify(data) })
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
}
