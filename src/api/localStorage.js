import { DEFAULT_MEMBERS } from './constants.js';
import { LocalStorageService } from './localStorageService.js';

/**
 * Inicializa los datos por defecto si es la primera vez
 */
export const initializeDefaultData = (storageService) => {
    const existingMembers = storageService.getMembers();
    
    // Si no hay miembros, sembrar los datos por defecto
    if (existingMembers.length === 0 && DEFAULT_MEMBERS.length > 0) {
        console.log("No hay miembros existentes. Sembrando datos por defecto...");
        
        DEFAULT_MEMBERS.forEach(member => {
            storageService.addMember(member.name, member.role);
        });
        
        console.log("Miembros por defecto inicializados con éxito.");
    }
};

/**
 * Simula autenticación (genera o recupera ID de usuario)
 */
export const authenticateUser = async () => {
    // Simular un pequeño delay para consistencia con Firebase
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const storageService = new LocalStorageService();
    return {
        uid: storageService.userId,
        isAnonymous: true
    };
};

/**
 * Inicializa la aplicación con localStorage
 */
export const initializeLocalStorage = () => {
    const storageService = new LocalStorageService();
    
    // Inicializar datos por defecto
    initializeDefaultData(storageService);
    
    return {
        storageService,
        userId: storageService.userId
    };
};

/**
 * Configura los listeners de datos locales
 */
export const setupLocalStorageListeners = (storageService, callbacks) => {
    const { 
        onMembersChange, 
        onFeedbackChange, 
        onError 
    } = callbacks;

    let unsubscribeMembers;
    let unsubscribeFeedback;

    try {
        // Configurar listener para miembros
        unsubscribeMembers = storageService.onMembersChange((members) => {
            const sortedMembers = members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            onMembersChange(sortedMembers);
        });

        // Configurar listener para feedback
        unsubscribeFeedback = storageService.onFeedbackChange((feedback) => {
            onFeedbackChange(feedback);
        });

    } catch (error) {
        console.error("Error al configurar listeners:", error);
        onError("Error al configurar la escucha de datos locales.");
    }

    // Retornar función de limpieza
    return () => {
        if (unsubscribeMembers) unsubscribeMembers();
        if (unsubscribeFeedback) unsubscribeFeedback();
    };
};
