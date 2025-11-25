import { useState, useEffect, useCallback } from 'react';
import { initializeLocalStorage, authenticateUser, setupLocalStorageListeners } from './localStorage.js';
import { FeedbackService } from './feedbackService.js';
import { MembersService } from './membersService.js';

/**
 * Hook personalizado para manejar la inicialización y el estado de localStorage.
 * Este hook encapsula la lógica de la "API" para el manejo de datos (feedback y miembros).
 */
export const useLocalStorageData = () => {
    const [storageService, setStorageService] = useState(null);
    const [userId, setUserId] = useState(null);
    const [feedbackData, setFeedbackData] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackService, setFeedbackService] = useState(null);
    const [membersService, setMembersService] = useState(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                
                // Simular autenticación
                const user = await authenticateUser();
                setUserId(user.uid);

                // Inicializar localStorage
                const { storageService: storage } = initializeLocalStorage();
                setStorageService(storage);

                // Inicializar servicios
                const feedback = new FeedbackService(storage);
                const members = new MembersService(storage);
                setFeedbackService(feedback);
                setMembersService(members);

                // Configurar listeners
                const unsubscribeListeners = setupLocalStorageListeners(storage, {
                    onMembersChange: (members) => setTeamMembers(members),
                    onFeedbackChange: (feedback) => {
                        setFeedbackData(feedback);
                        setIsLoading(false);
                    },
                    onError: (errorMessage) => {
                        setError(errorMessage);
                        setIsLoading(false);
                    }
                });

                return unsubscribeListeners;

            } catch (e) {
                console.error("Fallo la inicialización:", e);
                setError(`Error crítico de inicialización: ${e.message}`);
                setIsLoading(false);
            }
        };

        const cleanup = initializeApp();
        return () => {
            if (cleanup && typeof cleanup.then === 'function') {
                cleanup.then(unsubscribe => {
                    if (unsubscribe && typeof unsubscribe === 'function') {
                        unsubscribe();
                    }
                });
            }
        };
    }, []);

    // Funciones de CRUD para Feedback
    const addFeedback = useCallback(async (newFeedback) => {
        if (!feedbackService) return;
        try {
            await feedbackService.addFeedback(newFeedback, userId);
        } catch (error) {
            setError(error.message);
        }
    }, [feedbackService, userId]);

    const deleteFeedback = useCallback(async (id) => {
        if (!feedbackService) return;
        try {
            await feedbackService.deleteFeedback(id);
        } catch (error) {
            setError(error.message);
        }
    }, [feedbackService]);

    // Funciones de CRUD para Miembros
    const addMember = useCallback(async (name, role) => {
        if (!membersService) return;
        try {
            await membersService.addMember(name, role);
        } catch (error) {
            setError(error.message);
        }
    }, [membersService]);

    const deleteMember = useCallback(async (memberId) => {
        if (!membersService) return;
        try {
            await membersService.deleteMember(memberId);
        } catch (error) {
            setError(error.message);
        }
    }, [membersService]);

    return { 
        feedbackData, 
        isLoading, 
        error, 
        userId, 
        teamMembers, 
        addFeedback, 
        deleteFeedback, 
        addMember, 
        deleteMember 
    };
};

// Mantener el nombre anterior para compatibilidad
export const useFirestoreData = useLocalStorageData;
