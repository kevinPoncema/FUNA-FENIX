import { useState, useEffect, useCallback } from 'react';
import { LocalStorageProvider } from './providers/LocalStorageProvider.js';
import { TeamMembersService } from './services/TeamMembersService.js';
import { FeedbackService } from './services/FeedbackService.js';
import { DEFAULT_MEMBERS } from './constants.js';

/**
 * Hook simplificado para debugging - usa directamente LocalStorageProvider
 * Esto nos ayudará a identificar si el problema está en DataManager o en otra parte
 */
export const useSimpleLocalStorage = () => {
    const [provider] = useState(() => new LocalStorageProvider());
    const [userId, setUserId] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [membersService, setMembersService] = useState(null);
    const [feedbackService, setFeedbackService] = useState(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log('Iniciando inicialización...');

                // Inicializar proveedor
                await provider.initialize({
                    defaultMembers: DEFAULT_MEMBERS
                });

                console.log('Proveedor inicializado');

                // Autenticar
                const authResult = await provider.authenticate();
                setUserId(authResult.uid);

                console.log('Usuario autenticado:', authResult.uid);

                // Crear servicios
                const members = new TeamMembersService(provider);
                const feedback = new FeedbackService(provider, authResult.uid);

                setMembersService(members);
                setFeedbackService(feedback);

                console.log('Servicios creados');

                // Configurar listeners
                const unsubscribeMembers = provider.onMembersChange((members) => {
                    console.log('Miembros actualizados:', members.length);
                    setTeamMembers(members);
                });

                const unsubscribeFeedback = provider.onFeedbackChange((feedback) => {
                    console.log('Feedback actualizado:', feedback.length);
                    setFeedbackData(feedback);
                    setIsLoading(false);
                });

                setIsInitialized(true);
                console.log('Inicialización completa');

                return () => {
                    unsubscribeMembers();
                    unsubscribeFeedback();
                };

            } catch (e) {
                console.error("Error en la inicialización:", e);
                setError(`Error crítico de inicialización: ${e.message}`);
                setIsLoading(false);
            }
        };

        let cleanup = initializeApp();

        return () => {
            if (cleanup && typeof cleanup.then === 'function') {
                cleanup.then(cleanupFn => {
                    if (typeof cleanupFn === 'function') {
                        cleanupFn();
                    }
                });
            }
        };
    }, [provider]);

    // Funciones de CRUD para Feedback
    const addFeedback = useCallback(async (newFeedback) => {
        if (!isInitialized || !feedbackService) {
            console.warn('Servicio no inicializado aún');
            return;
        }
        
        try {
            console.log('Añadiendo feedback:', newFeedback);
            await feedbackService.addFeedback(newFeedback);
        } catch (error) {
            console.error('Error al añadir feedback:', error);
            setError(error.message);
        }
    }, [feedbackService, isInitialized]);

    const deleteFeedback = useCallback(async (id) => {
        if (!isInitialized || !feedbackService) {
            console.warn('Servicio no inicializado aún');
            return;
        }
        
        try {
            console.log('Eliminando feedback:', id);
            await feedbackService.deleteFeedback(id);
        } catch (error) {
            console.error('Error al eliminar feedback:', error);
            setError(error.message);
        }
    }, [feedbackService, isInitialized]);

    // Funciones de CRUD para Miembros
    const addMember = useCallback(async (name, role) => {
        if (!isInitialized || !membersService) {
            console.warn('Servicio no inicializado aún');
            return;
        }
        
        try {
            console.log('Añadiendo miembro:', name, role);
            await membersService.addMember(name, role);
        } catch (error) {
            console.error('Error al añadir miembro:', error);
            setError(error.message);
        }
    }, [membersService, isInitialized]);

    const deleteMember = useCallback(async (memberId) => {
        if (!isInitialized || !membersService) {
            console.warn('Servicio no inicializado aún');
            return;
        }
        
        try {
            console.log('Eliminando miembro:', memberId);
            await membersService.deleteMember(memberId);
        } catch (error) {
            console.error('Error al eliminar miembro:', error);
            setError(error.message);
        }
    }, [membersService, isInitialized]);

    const updateMember = useCallback(async (memberId, updateData) => {
        if (!isInitialized || !membersService) {
            console.warn('Servicio no inicializado aún');
            return;
        }
        
        try {
            console.log('Actualizando miembro:', memberId, updateData);
            await membersService.updateMember(memberId, updateData);
        } catch (error) {
            console.error('Error al actualizar miembro:', error);
            setError(error.message);
        }
    }, [membersService, isInitialized]);

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
        updateMember,
        
        // Estado del sistema
        isInitialized
    };
};
