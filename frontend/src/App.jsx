import React, { useState, useCallback, useEffect } from 'react';
import { useAPI } from './api/useAPI.js';
import Loading from './components/Loading.jsx';
import ErrorDisplay from './components/ErrorDisplay.jsx';
import Header from './components/Header.jsx';
import UserInfo from './components/UserInfo.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';
import MainBoard from './components/MainBoard.jsx';
import FeedbackFormModal from './components/FeedbackFormModal.jsx';
import MemberManagementModal from './components/MemberManagementModal.jsx';
import PostItDetailModal from './components/PostItDetailModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import AuthenticationModal from './components/AuthenticationModal.jsx';

/**
 * Componente Principal de la Aplicación
 */
const App = () => {
    const { 
        feedbackData, 
        isLoading, 
        error, 
        user,
        userId, 
        teamMembers, 
        isAdmin,
        isAuthenticated,
        webSocketFeedbackIds,
        addFeedback, 
        deleteFeedback, 
        addMember, 
        deleteMember,
        updateMember,
        loginAsAdmin,
        loginAsGuest,
        logout,
        clearError
    } = useAPI();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState(null); // 'admin' | 'guest' | null
    
    // Estado para el modal de detalle del post-it
    const [detailModalState, setDetailModalState] = useState({ 
        isVisible: false, 
        feedback: null 
    });

    // Efecto para mostrar el modal de login si no está autenticado
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setIsLoginModalOpen(true);
        }
    }, [isLoading, isAuthenticated]);

    const handleSaveFeedback = (formData) => {
        addFeedback(formData);
    };

    const handleToggleModal = () => setIsModalOpen(prev => !prev);
    const handleToggleManagementModal = () => {
        if (!isAdmin) {
            setAuthMode('admin');
            setIsLoginModalOpen(true);
            return;
        }
        setIsManagementOpen(prev => !prev);
    };
    
    const handleLoginAsAdmin = async (email, password) => {
        await loginAsAdmin(email, password);
        setIsLoginModalOpen(false);
        setAuthMode(null);
    };

    const handleLoginAsGuest = async (name = null) => {
        await loginAsGuest(name);
        setIsLoginModalOpen(false);
        setAuthMode(null);
    };
    
    const handleLogout = () => {
        logout();
    };
    
    // Función para abrir el modal de detalle
    const handleOpenDetailModal = useCallback((feedback) => {
        setDetailModalState({ isVisible: true, feedback });
    }, []);

    // Función para cerrar el modal de detalle
    const handleCloseDetailModal = useCallback(() => {
        setDetailModalState({ isVisible: false, feedback: null });
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="app-container">
                <ErrorDisplay error={error} onRetry={clearError} />
            </div>
        );
    }

    // Si no está autenticado, mostrar solo el modal de login
    if (!isAuthenticated) {
        return (
            <div className="app-container">
                <div className="min-h-screen flex items-center justify-center">
                    <AuthenticationModal
                        isVisible={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                        onLoginAsAdmin={handleLoginAsAdmin}
                        onLoginAsGuest={handleLoginAsGuest}
                        authMode={authMode}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Información del Usuario */}
            <UserInfo user={user} onLogout={isAdmin ? handleLogout : null} />

            {/* Header */}
            <Header />

            {/* Botones Flotantes */}
            <FloatingButtons 
                onOpenFeedbackModal={handleToggleModal}
                onOpenManagementModal={handleToggleManagementModal}
                isAdmin={isAdmin}
            />

            {/* Tablero Principal */}
            <MainBoard 
                teamMembers={teamMembers}
                feedbackData={feedbackData}
                userId={userId}
                deleteFeedback={deleteFeedback}
                onOpenDetail={handleOpenDetailModal}
                webSocketFeedbackIds={webSocketFeedbackIds}
            />

            {/* Modal del Formulario de Feedback */}
            <FeedbackFormModal
                members={teamMembers}
                isVisible={isModalOpen}
                onClose={handleToggleModal}
                onSave={handleSaveFeedback}
            />

            {/* Modal de Administración de Miembros */}
            {isAdmin && (
                <MemberManagementModal
                    members={teamMembers}
                    isVisible={isManagementModalOpen}
                    onClose={handleToggleManagementModal}
                    onAdd={addMember}
                    onDelete={deleteMember}
                    onUpdate={updateMember}
                />
            )}
            
            {/* Modal de Login para Admin */}
            {authMode === 'admin' && (
                <LoginModal
                    isVisible={isLoginModalOpen}
                    onClose={() => {
                        setIsLoginModalOpen(false);
                        setAuthMode(null);
                    }}
                    onLogin={handleLoginAsAdmin}
                />
            )}
            
            {/* Modal de Detalle de Post-it */}
            <PostItDetailModal
                isVisible={detailModalState.isVisible}
                onClose={handleCloseDetailModal}
                feedback={detailModalState.feedback}
                members={teamMembers}
            />
        </div>
    );
};

export default App;
