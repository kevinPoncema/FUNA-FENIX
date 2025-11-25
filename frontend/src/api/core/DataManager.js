import { DataProviderFactory } from './DataProviderFactory.js';
import { TeamMembersService } from '../services/TeamMembersService.js';
import { FeedbackService } from '../services/FeedbackService.js';
import { DEFAULT_MEMBERS } from '../constants.js';
import { handleError } from '../utils/helpers.js';

/**
 * Manager principal que coordina todos los servicios y proveedores
 * Punto de entrada único para toda la lógica de datos
 */
export class DataManager {
    constructor() {
        this.provider = null;
        this.membersService = null;
        this.feedbackService = null;
        this.userId = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa el manager con un proveedor específico
     * @param {Object} config - Configuración de inicialización
     * @param {string} config.providerType - Tipo de proveedor a usar
     * @param {Object} config.providerConfig - Configuración específica del proveedor
     * @param {boolean} config.useDefaultMembers - Si usar miembros por defecto
     * @returns {Promise<Object>} Resultado de la inicialización
     */
    async initialize(config = {}) {
        try {
            const {
                providerType = DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE,
                providerConfig = {},
                useDefaultMembers = true
            } = config;

            // Crear el proveedor
            this.provider = DataProviderFactory.createProvider(providerType, providerConfig);

            // Configurar miembros por defecto si se requiere
            if (useDefaultMembers) {
                providerConfig.defaultMembers = DEFAULT_MEMBERS;
            }

            // Inicializar el proveedor
            const initResult = await this.provider.initialize(providerConfig);
            this.userId = initResult.userId;

            // Autenticar usuario
            const authResult = await this.provider.authenticate();
            this.userId = authResult.uid;

            // Crear servicios
            this.membersService = new TeamMembersService(this.provider);
            this.feedbackService = new FeedbackService(this.provider, this.userId);

            this.isInitialized = true;

            return {
                success: true,
                userId: this.userId,
                providerType,
                authResult
            };

        } catch (error) {
            throw handleError(error, 'Error al inicializar DataManager');
        }
    }

    /**
     * Verifica que el manager esté inicializado
     */
    _ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('DataManager no está inicializado. Llama a initialize() primero.');
        }
    }

    /**
     * Obtiene el servicio de miembros
     * @returns {TeamMembersService} Servicio de miembros
     */
    getTeamMembersService() {
        this._ensureInitialized();
        return this.membersService;
    }

    /**
     * Obtiene el servicio de feedback
     * @returns {FeedbackService} Servicio de feedback
     */
    getFeedbackService() {
        this._ensureInitialized();
        return this.feedbackService;
    }

    /**
     * Obtiene el proveedor de datos actual
     * @returns {IDataProvider} Proveedor de datos
     */
    getDataProvider() {
        this._ensureInitialized();
        return this.provider;
    }

    /**
     * Obtiene el ID del usuario actual
     * @returns {string} ID del usuario
     */
    getUserId() {
        this._ensureInitialized();
        return this.userId;
    }

    /**
     * Configura listeners para cambios de datos
     * @param {Object} callbacks - Callbacks para diferentes tipos de cambios
     * @param {Function} callbacks.onMembersChange - Callback para cambios de miembros
     * @param {Function} callbacks.onFeedbackChange - Callback para cambios de feedback
     * @param {Function} callbacks.onError - Callback para errores
     * @returns {Function} Función de limpieza que desuscribe todos los listeners
     */
    setupListeners(callbacks = {}) {
        this._ensureInitialized();

        const {
            onMembersChange,
            onFeedbackChange,
            onError
        } = callbacks;

        const unsubscribers = [];

        try {
            // Configurar listener para miembros
            if (onMembersChange) {
                const unsubscribeMembers = this.membersService.onMembersChange((members) => {
                    const sortedMembers = members.sort((a, b) => 
                        (a.name || '').localeCompare(b.name || '')
                    );
                    onMembersChange(sortedMembers);
                });
                unsubscribers.push(unsubscribeMembers);
            }

            // Configurar listener para feedback
            if (onFeedbackChange) {
                const unsubscribeFeedback = this.feedbackService.onFeedbackChange(onFeedbackChange);
                unsubscribers.push(unsubscribeFeedback);
            }

        } catch (error) {
            if (onError) {
                onError(handleError(error, 'Error al configurar listeners'));
            }
        }

        // Retornar función de limpieza
        return () => {
            unsubscribers.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
        };
    }

    /**
     * Cambia el proveedor de datos
     * @param {string} newProviderType - Nuevo tipo de proveedor
     * @param {Object} config - Configuración del nuevo proveedor
     * @returns {Promise<Object>} Resultado del cambio
     */
    async changeProvider(newProviderType, config = {}) {
        try {
            // Desconectar proveedor actual si existe
            if (this.provider) {
                await this.provider.disconnect();
            }

            // Reinicializar con nuevo proveedor
            const initConfig = {
                providerType: newProviderType,
                providerConfig: config,
                useDefaultMembers: false // No sobrescribir datos existentes
            };

            return await this.initialize(initConfig);

        } catch (error) {
            throw handleError(error, 'Error al cambiar proveedor');
        }
    }

    /**
     * Limpia todos los datos
     */
    async clearAllData() {
        this._ensureInitialized();
        
        try {
            await this.provider.clearAll();
        } catch (error) {
            throw handleError(error, 'Error al limpiar datos');
        }
    }

    /**
     * Desconecta y limpia recursos
     */
    async disconnect() {
        if (this.provider) {
            await this.provider.disconnect();
        }
        
        this.provider = null;
        this.membersService = null;
        this.feedbackService = null;
        this.userId = null;
        this.isInitialized = false;
    }

    /**
     * Obtiene información del estado actual
     * @returns {Object} Estado del manager
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            userId: this.userId,
            providerType: this.provider?.constructor.name || null,
            hasServices: !!(this.membersService && this.feedbackService)
        };
    }
}
