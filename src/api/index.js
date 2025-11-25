// Exportaciones principales del nuevo sistema de API genérico

// Core - Sistema principal
export { DataManager } from './core/DataManager.js';
export { DataProviderFactory } from './core/DataProviderFactory.js';
export { EventEmitter } from './core/EventEmitter.js';

// Interfaces
export { IDataProvider } from './interfaces/IDataProvider.js';

// Proveedores implementados
export { LocalStorageProvider } from './providers/LocalStorageProvider.js';

// Servicios
export { TeamMembersService } from './services/TeamMembersService.js';
export { FeedbackService } from './services/FeedbackService.js';

// Hooks de React
export { 
    useDataProvider, 
    useLocalStorageData, 
    useFirestoreData // Mantener para compatibilidad
} from './useDataProvider.js';

// Utilidades
export { 
    generateId, 
    getTimestamp, 
    validateMemberData, 
    validateFeedbackData, 
    delay, 
    handleError, 
    sanitizeString 
} from './utils/helpers.js';

// Constantes
export { DEFAULT_MEMBERS, MAX_POSTIT_CHARS, MAX_TITLE_CHARS } from './constants.js';

// Configuración por defecto para facilitar el uso
export const DEFAULT_CONFIG = {
    localStorage: {
        providerType: 'localStorage',
        providerConfig: {},
        useDefaultMembers: true,
        autoInitialize: true
    }
};

// Factory simplificado para casos comunes
export const createLocalStorageAPI = (config = {}) => {
    return {
        providerType: DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE,
        ...DEFAULT_CONFIG.localStorage,
        ...config
    };
};
