/**
 * Servicio de localStorage para manejar datos localmente
 */

// Claves para localStorage
const STORAGE_KEYS = {
    TEAM_MEMBERS: 'retro_team_members',
    FEEDBACK: 'retro_feedback',
    USER_ID: 'retro_user_id'
};

/**
 * Genera un ID único
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Genera un timestamp
 */
const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Obtiene datos del localStorage con manejo de errores
 */
const getFromStorage = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error al leer ${key} del localStorage:`, error);
        return defaultValue;
    }
};

/**
 * Guarda datos en localStorage con manejo de errores
 */
const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error);
        return false;
    }
};

/**
 * Clase para manejar eventos de cambios en localStorage
 */
class LocalStorageEventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Instancia global del event emitter
export const storageEmitter = new LocalStorageEventEmitter();

/**
 * Servicio principal de localStorage
 */
export class LocalStorageService {
    constructor() {
        this.emitter = storageEmitter;
        this.userId = this.getUserId();
    }

    /**
     * Obtiene o genera un ID de usuario
     */
    getUserId() {
        let userId = getFromStorage(STORAGE_KEYS.USER_ID, null);
        if (!userId) {
            userId = `user_${generateId()}`;
            saveToStorage(STORAGE_KEYS.USER_ID, userId);
        }
        return userId;
    }

    /**
     * Obtiene todos los miembros
     */
    getMembers() {
        return getFromStorage(STORAGE_KEYS.TEAM_MEMBERS, []);
    }

    /**
     * Guarda los miembros y emite evento de cambio
     */
    saveMembers(members) {
        if (saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, members)) {
            this.emitter.emit('membersChanged', members);
            return true;
        }
        return false;
    }

    /**
     * Añade un nuevo miembro
     */
    addMember(name, role = 'Miembro de Equipo') {
        const members = this.getMembers();
        const newMember = {
            id: generateId(),
            name: name.trim(),
            role: role.trim(),
            createdAt: getTimestamp()
        };
        
        members.push(newMember);
        return this.saveMembers(members);
    }

    /**
     * Elimina un miembro
     */
    deleteMember(memberId) {
        const members = this.getMembers();
        const updatedMembers = members.filter(member => member.id !== memberId);
        
        // También eliminar todo el feedback relacionado
        const feedback = this.getFeedback();
        const updatedFeedback = feedback.filter(item => item.targetId !== memberId);
        this.saveFeedback(updatedFeedback);
        
        return this.saveMembers(updatedMembers);
    }

    /**
     * Obtiene todo el feedback
     */
    getFeedback() {
        return getFromStorage(STORAGE_KEYS.FEEDBACK, []);
    }

    /**
     * Guarda el feedback y emite evento de cambio
     */
    saveFeedback(feedback) {
        if (saveToStorage(STORAGE_KEYS.FEEDBACK, feedback)) {
            this.emitter.emit('feedbackChanged', feedback);
            return true;
        }
        return false;
    }

    /**
     * Añade nuevo feedback
     */
    addFeedback(feedbackData) {
        const feedback = this.getFeedback();
        const newFeedback = {
            id: generateId(),
            ...feedbackData,
            authorId: this.userId,
            timestamp: getTimestamp()
        };
        
        feedback.push(newFeedback);
        return this.saveFeedback(feedback);
    }

    /**
     * Elimina feedback
     */
    deleteFeedback(feedbackId) {
        const feedback = this.getFeedback();
        const updatedFeedback = feedback.filter(item => item.id !== feedbackId);
        return this.saveFeedback(updatedFeedback);
    }

    /**
     * Suscribe a cambios en miembros
     */
    onMembersChange(callback) {
        this.emitter.on('membersChanged', callback);
        // Llamar inmediatamente con datos actuales
        callback(this.getMembers());
        
        return () => this.emitter.off('membersChanged', callback);
    }

    /**
     * Suscribe a cambios en feedback
     */
    onFeedbackChange(callback) {
        this.emitter.on('feedbackChanged', callback);
        // Llamar inmediatamente con datos actuales
        callback(this.getFeedback());
        
        return () => this.emitter.off('feedbackChanged', callback);
    }

    /**
     * Limpia todos los datos (útil para testing)
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.TEAM_MEMBERS);
        localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        this.userId = this.getUserId();
    }
}

// Exportar constantes útiles
export { STORAGE_KEYS, generateId, getTimestamp };
