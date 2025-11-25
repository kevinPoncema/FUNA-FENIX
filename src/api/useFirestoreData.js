import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, authenticateUser, setupFirestoreListeners } from '../api/firebase.js';
import { FeedbackService } from '../api/feedbackService.js';
import { MembersService } from '../api/membersService.js';

/**
 * Hook personalizado para manejar la inicialización y el estado de Firebase.
 * Este hook encapsula la lógica de la "API" para el manejo de datos (feedback y miembros).
 */
export const useFirestoreData = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [feedbackData, setFeedbackData] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackService, setFeedbackService] = useState(null);
    const [membersService, setMembersService] = useState(null);

    // Configuraciones y variables globales del entorno Canvas
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    let firebaseConfig = null;
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Intentar parsear la configuración de Firebase
    try {
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
            firebaseConfig = JSON.parse(__firebase_config);
        }
    } catch (e) {
        if (!error) setError(`Error en la configuración JSON de Firebase: ${e.message}`);
    }

    useEffect(() => {
        if (error) {
            setIsLoading(false);
            return;
        }

        if (!firebaseConfig || !firebaseConfig.apiKey) {
            setError("Error: Configuración de Firebase incompleta o inválida.");
            setIsLoading(false);
            return;
        }

        try {
            const { firestore, auth } = initializeFirebase(firebaseConfig);
            setDb(firestore);
            setAuth(auth);

            // Inicializar servicios
            const feedback = new FeedbackService(firestore, appId);
            const members = new MembersService(firestore, appId);
            setFeedbackService(feedback);
            setMembersService(members);

            // Manejar Autenticación
            const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    
                    // Establecer Listeners de Firestore
                    const unsubscribeListeners = setupFirestoreListeners(firestore, appId, {
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
                } else {
                    // Intentar inicio de sesión
                    await authenticateUser(auth, initialAuthToken);
                }
            });

            return () => unsubscribeAuth();

        } catch (e) {
            console.error("Fallo la inicialización de Firebase:", e);
            setError(`Error crítico de inicialización: ${e.message}`);
            setIsLoading(false);
        }
    }, [appId, initialAuthToken, error, firebaseConfig]);

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
