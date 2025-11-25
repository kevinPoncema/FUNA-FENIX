import { IDataProvider } from '../interfaces/IDataProvider.js';
import { EventEmitter } from '../core/EventEmitter.js';
import { generateId, getTimestamp, validateMemberData, validateFeedbackData, handleError, sanitizeString } from '../utils/helpers.js';

// Claves para localStorage
const STORAGE_KEYS = {
    TEAM_MEMBERS: 'retro_team_members',
    FEEDBACK: 'retro_feedback',
    USER_ID: 'retro_user_id'
};

/**
 * Proveedor de datos usando localStorage
 * Implementa la interfaz IDataProvider
 */
export class LocalStorageProvider extends IDataProvider {
    constructor() {
        super();
        this.eventEmitter = new EventEmitter();
        this.userId = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa el proveedor de localStorage
     */
    async initialize(config = {}) {
        try {
            this.userId = this._getUserId();
            this.isInitialized = true;
            
            // Inicializar datos por defecto si se proporcionan
            if (config.defaultMembers && config.defaultMembers.length > 0) {
                this._initializeDefaultData(config.defaultMembers);
            }
            
            return { success: true, userId: this.userId };
        } catch (error) {
            throw handleError(error, 'Error al inicializar LocalStorageProvider');
        }
    }

    /**
     * Simula autenticación
     */
    async authenticate() {
        if (!this.isInitialized) {
            throw new Error('Proveedor no inicializado. Llama a initialize() primero.');
        }
        
        return {
            uid: this.userId,
            isAnonymous: true,
            provider: 'localStorage'
        };
    }

    /**
     * Obtiene todos los miembros
     */
    async getMembers() {
        this._ensureInitialized();
        return this._getFromStorage(STORAGE_KEYS.TEAM_MEMBERS, []);
    }

    /**
     * Añade un nuevo miembro
     */
    async addMember(memberData) {
        this._ensureInitialized();
        
        // Validar datos
        const validation = validateMemberData(memberData);
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        const members = await this.getMembers();
        const newMember = {
            id: generateId(),
            name: sanitizeString(memberData.name),
            role: sanitizeString(memberData.role || 'Miembro de Equipo'),
            createdAt: getTimestamp()
        };
        
        members.push(newMember);
        
        if (this._saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, members)) {
            this.eventEmitter.emit('membersChanged', members);
            return newMember;
        } else {
            throw new Error('No se pudo guardar el miembro');
        }
    }

    /**
     * Elimina un miembro
     */
    async deleteMember(memberId) {
        this._ensureInitialized();
        
        if (!memberId) {
            throw new Error('ID de miembro requerido');
        }

        const members = await this.getMembers();
        const memberExists = members.some(member => member.id === memberId);
        
        if (!memberExists) {
            throw new Error('Miembro no encontrado');
        }

        const updatedMembers = members.filter(member => member.id !== memberId);
        
        // También eliminar todo el feedback relacionado
        const feedback = await this.getFeedback();
        const updatedFeedback = feedback.filter(item => item.targetId !== memberId);
        
        // Guardar ambos cambios
        const membersSaved = this._saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updatedMembers);
        const feedbackSaved = this._saveToStorage(STORAGE_KEYS.FEEDBACK, updatedFeedback);
        
        if (membersSaved && feedbackSaved) {
            this.eventEmitter.emit('membersChanged', updatedMembers);
            this.eventEmitter.emit('feedbackChanged', updatedFeedback);
            return true;
        } else {
            throw new Error('No se pudo eliminar el miembro');
        }
    }

    /**
     * Obtiene todo el feedback
     */
    async getFeedback() {
        this._ensureInitialized();
        return this._getFromStorage(STORAGE_KEYS.FEEDBACK, []);
    }

    /**
     * Añade nuevo feedback
     */
    async addFeedback(feedbackData) {
        this._ensureInitialized();
        
        // Validar datos
        const validation = validateFeedbackData(feedbackData);
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        const feedback = await this.getFeedback();
        const newFeedback = {
            id: generateId(),
            targetId: feedbackData.targetId,
            category: feedbackData.category,
            title: sanitizeString(feedbackData.title),
            text: sanitizeString(feedbackData.text),
            authorId: this.userId,
            timestamp: getTimestamp()
        };
        
        feedback.push(newFeedback);
        
        if (this._saveToStorage(STORAGE_KEYS.FEEDBACK, feedback)) {
            this.eventEmitter.emit('feedbackChanged', feedback);
            return newFeedback;
        } else {
            throw new Error('No se pudo guardar el feedback');
        }
    }

    /**
     * Elimina feedback
     */
    async deleteFeedback(feedbackId) {
        this._ensureInitialized();
        
        if (!feedbackId) {
            throw new Error('ID de feedback requerido');
        }

        const feedback = await this.getFeedback();
        const feedbackExists = feedback.some(item => item.id === feedbackId);
        
        if (!feedbackExists) {
            throw new Error('Feedback no encontrado');
        }

        const updatedFeedback = feedback.filter(item => item.id !== feedbackId);
        
        if (this._saveToStorage(STORAGE_KEYS.FEEDBACK, updatedFeedback)) {
            this.eventEmitter.emit('feedbackChanged', updatedFeedback);
            return true;
        } else {
            throw new Error('No se pudo eliminar el feedback');
        }
    }

    /**
     * Suscribe a cambios de miembros
     */
    onMembersChange(callback) {
        this.eventEmitter.on('membersChanged', callback);
        
        // Llamar inmediatamente con datos actuales
        this.getMembers().then(members => callback(members));
        
        return () => this.eventEmitter.off('membersChanged', callback);
    }

    /**
     * Suscribe a cambios de feedback
     */
    onFeedbackChange(callback) {
        this.eventEmitter.on('feedbackChanged', callback);
        
        // Llamar inmediatamente con datos actuales
        this.getFeedback().then(feedback => callback(feedback));
        
        return () => this.eventEmitter.off('feedbackChanged', callback);
    }

    /**
     * Limpia todos los datos
     */
    async clearAll() {
        localStorage.removeItem(STORAGE_KEYS.TEAM_MEMBERS);
        localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        this.userId = this._getUserId();
        
        this.eventEmitter.emit('membersChanged', []);
        this.eventEmitter.emit('feedbackChanged', []);
    }

    /**
     * Desconectar - limpia listeners
     */
    async disconnect() {
        this.eventEmitter.removeAllListeners();
        this.isInitialized = false;
    }

    // Métodos privados

    /**
     * Obtiene o genera un ID de usuario
     */
    _getUserId() {
        let userId = this._getFromStorage(STORAGE_KEYS.USER_ID, null);
        if (!userId) {
            userId = `user_${generateId()}`;
            this._saveToStorage(STORAGE_KEYS.USER_ID, userId);
        }
        return userId;
    }

    /**
     * Verifica que el proveedor esté inicializado
     */
    _ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Proveedor no inicializado. Llama a initialize() primero.');
        }
    }

    /**
     * Obtiene datos del localStorage con manejo de errores
     */
    _getFromStorage(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error al leer ${key} del localStorage:`, error);
            return defaultValue;
        }
    }

    /**
     * Guarda datos en localStorage con manejo de errores
     */
    _saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error al guardar ${key} en localStorage:`, error);
            return false;
        }
    }

    /**
     * Inicializa datos por defecto si es necesario
     */
    _initializeDefaultData(defaultMembers) {
        const existingMembers = this._getFromStorage(STORAGE_KEYS.TEAM_MEMBERS, []);
        
        if (existingMembers.length === 0 && defaultMembers.length > 0) {
            console.log("No hay miembros existentes. Sembrando datos por defecto...");
            
            const membersToAdd = defaultMembers.map(member => ({
                id: generateId(),
                name: sanitizeString(member.name),
                role: sanitizeString(member.role || 'Miembro de Equipo'),
                createdAt: getTimestamp()
            }));
            
            this._saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, membersToAdd);
            console.log("Miembros por defecto inicializados con éxito.");
        }
    }
}
