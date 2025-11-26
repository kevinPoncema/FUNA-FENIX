import { useState, useEffect, useCallback } from 'react';
import apiService from './apiService.js';

/**
 * Hook simplificado que maneja el estado de la aplicación usando llamadas a la API
 */
export const useAPI = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Función para manejar errores
    const handleError = (error) => {
        console.error('API Error:', error);
        setError(error.message || 'An error occurred');
    };

    // Función para cargar datos iniciales
    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Usar el endpoint team-members-with-feedbacks como método principal
            const data = await apiService.getTeamMembersWithFeedbacks();
            
            // Los datos vienen en el formato correcto del backend
            setTeamMembers(data.map(member => ({
                ...member,
                feedbacks: member.feedbacks || []
            })));
            
            // Extraer todos los feedbacks de todos los miembros
            const allFeedbacks = data.reduce((acc, member) => {
                return acc.concat(member.feedbacks || []);
            }, []);
            setFeedbackData(allFeedbacks);

        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Inicialización
    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Verificar si ya está autenticado
                if (apiService.isAuthenticated()) {
                    setUser(apiService.getCurrentUser());
                    await loadData();
                    setIsInitialized(true);
                } else {
                    // No auto-login, esperar que el usuario se autentique
                    setIsInitialized(false);
                }

            } catch (error) {
                handleError(error);
            } finally {
                setIsLoading(false);
            }
        };

        initialize();
    }, []);

    // Funciones de autenticación
    const loginAsAdmin = useCallback(async (email, password) => {
        try {
            setIsLoading(true);
            const result = await apiService.loginAsAdmin(email, password);
            setUser(result.user);
            await loadData();
            setIsInitialized(true);
            return result;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginAsGuest = useCallback(async (name = null) => {
        try {
            setIsLoading(true);
            const result = await apiService.loginAsGuest(name);
            setUser(result.user);
            await loadData();
            setIsInitialized(true);
            return result;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiService.logout();
            setUser(null);
            setTeamMembers([]);
            setFeedbackData([]);
            setIsInitialized(false);
        } catch (error) {
            handleError(error);
        }
    }, []);

    // Funciones de Team Members
    const addMember = useCallback(async (name, role) => {
        try {
            const newMember = await apiService.createTeamMember(name, role);
            setTeamMembers(prev => [...prev, newMember]);
            return newMember;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    const updateMember = useCallback(async (memberId, { name, role }) => {
        try {
            const updatedMember = await apiService.updateTeamMember(memberId, name, role);
            setTeamMembers(prev => prev.map(member => 
                member.id === memberId ? updatedMember : member
            ));
            return updatedMember;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    const deleteMember = useCallback(async (memberId) => {
        try {
            await apiService.deleteTeamMember(memberId);
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            
            // También eliminar feedbacks relacionados
            setFeedbackData(prev => prev.filter(feedback => feedback.target_id !== memberId));
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    // Funciones de Feedback
    const addFeedback = useCallback(async (feedbackData) => {
        try {
            const { targetId, category, title, text } = feedbackData;
            const newFeedback = await apiService.createFeedback(targetId, category, title, text);
            setFeedbackData(prev => [...prev, newFeedback]);
            return newFeedback;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    const updateFeedback = useCallback(async (feedbackId, feedbackData) => {
        try {
            const { targetId, category, title, text } = feedbackData;
            const updatedFeedback = await apiService.updateFeedback(feedbackId, targetId, category, title, text);
            setFeedbackData(prev => prev.map(feedback => 
                feedback.id === feedbackId ? updatedFeedback : feedback
            ));
            return updatedFeedback;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    const deleteFeedback = useCallback(async (feedbackId) => {
        try {
            await apiService.deleteFeedback(feedbackId);
            setFeedbackData(prev => prev.filter(feedback => feedback.id !== feedbackId));
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, []);

    // Función para refrescar datos
    const refreshData = useCallback(async () => {
        await loadData();
    }, []);

    return {
        // Estado
        isLoading,
        error,
        user,
        userId: user?.id,
        teamMembers,
        feedbackData,
        isInitialized,
        isAuthenticated: apiService.isAuthenticated(),
        
        // Funciones de autenticación
        loginAsAdmin,
        loginAsGuest,
        logout,
        isAdmin: apiService.isAdmin(),
        
        // Funciones de Team Members
        addMember,
        updateMember,
        deleteMember,
        
        // Funciones de Feedback
        addFeedback,
        updateFeedback,
        deleteFeedback,
        
        // Utilidades
        refreshData,
        clearError: () => setError(null),
    };
};