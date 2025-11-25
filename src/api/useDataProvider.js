import { useState, useEffect, useCallback } from 'react';
import { DataManager } from '../core/DataManager.js';
import { DataProviderFactory } from '../core/DataProviderFactory.js';

/**
 * Hook personalizado para manejar datos usando el nuevo sistema genérico
 * Reemplaza al anterior useFirestoreData con una implementación genérica
 */
export const useDataProvider = (config = {}) => {
    const [dataManager] = useState(() => new DataManager());
    const [userId, setUserId] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configuración por defecto
    const {
        providerType = DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE,
        providerConfig = {},
        useDefaultMembers = true,
        autoInitialize = true
    } = config;

    useEffect(() => {
        if (!autoInitialize) return;

        const initializeApp = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Inicializar el DataManager
                const initResult = await dataManager.initialize({
                    providerType,
                    providerConfig,
                    useDefaultMembers
                });

                setUserId(initResult.userId);

                // Configurar listeners para cambios de datos
                const cleanup = dataManager.setupListeners({
                    onMembersChange: (members) => {
                        setTeamMembers(members);
                    },
                    onFeedbackChange: (feedback) => {
                        setFeedbackData(feedback);
                        setIsLoading(false);
                    },
                    onError: (errorMessage) => {
                        setError(errorMessage.message || errorMessage);
                        setIsLoading(false);
                    }
                });

                return cleanup;

            } catch (e) {
                console.error("Error en la inicialización:", e);
                setError(`Error crítico de inicialización: ${e.message}`);
                setIsLoading(false);
            }
        };

        let cleanupPromise = initializeApp();

        return () => {
            if (cleanupPromise && typeof cleanupPromise.then === 'function') {
                cleanupPromise.then(cleanup => {
                    if (cleanup && typeof cleanup === 'function') {
                        cleanup();
                    }
                });
            }
        };
    }, [dataManager, providerType, providerConfig, useDefaultMembers, autoInitialize]);

    // Funciones de CRUD para Feedback
    const addFeedback = useCallback(async (newFeedback) => {
        if (!dataManager.isInitialized) return;
        
        try {
            const feedbackService = dataManager.getFeedbackService();
            await feedbackService.addFeedback(newFeedback);
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    const deleteFeedback = useCallback(async (id) => {
        if (!dataManager.isInitialized) return;
        
        try {
            const feedbackService = dataManager.getFeedbackService();
            await feedbackService.deleteFeedback(id);
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    // Funciones de CRUD para Miembros
    const addMember = useCallback(async (name, role) => {
        if (!dataManager.isInitialized) return;
        
        try {
            const membersService = dataManager.getTeamMembersService();
            await membersService.addMember(name, role);
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    const deleteMember = useCallback(async (memberId) => {
        if (!dataManager.isInitialized) return;
        
        try {
            const membersService = dataManager.getTeamMembersService();
            await membersService.deleteMember(memberId);
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    // Función para cambiar proveedor dinámicamente
    const changeProvider = useCallback(async (newProviderType, newConfig = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            
            await dataManager.changeProvider(newProviderType, newConfig);
            
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    // Función para limpiar datos
    const clearAllData = useCallback(async () => {
        if (!dataManager.isInitialized) return;
        
        try {
            await dataManager.clearAllData();
        } catch (error) {
            setError(error.message);
        }
    }, [dataManager]);

    // Función para obtener estadísticas
    const getFeedbackStats = useCallback(async () => {
        if (!dataManager.isInitialized) return null;
        
        try {
            const feedbackService = dataManager.getFeedbackService();
            return await feedbackService.getFeedbackStats();
        } catch (error) {
            setError(error.message);
            return null;
        }
    }, [dataManager]);

    // Función para inicialización manual
    const initialize = useCallback(async (initConfig = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const result = await dataManager.initialize({
                providerType,
                providerConfig,
                useDefaultMembers,
                ...initConfig
            });
            
            setUserId(result.userId);
            return result;
            
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, [dataManager, providerType, providerConfig, useDefaultMembers]);

    return {
        // Estado
        feedbackData,
        isLoading,
        error,
        userId,
        teamMembers,
        
        // Acciones de Feedback
        addFeedback,
        deleteFeedback,
        
        // Acciones de Miembros
        addMember,
        deleteMember,
        
        // Funciones avanzadas
        changeProvider,
        clearAllData,
        getFeedbackStats,
        initialize,
        
        // Acceso directo al manager (para casos avanzados)
        dataManager,
        
        // Estado del sistema
        isInitialized: dataManager?.isInitialized || false,
        status: dataManager?.getStatus() || {}
    };
};

// Mantener el nombre anterior para compatibilidad
export const useFirestoreData = useDataProvider;

// Hook específico para localStorage (conveniencia)
export const useLocalStorageData = (config = {}) => {
    return useDataProvider({
        ...config,
        providerType: DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE
    });
};
