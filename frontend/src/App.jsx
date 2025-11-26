import React, { useState, useCallback } from 'react';
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
        addFeedback, 
        deleteFeedback, 
        addMember, 
        deleteMember,
        updateMember,
        loginAsAdmin,
        logout,
        clearError
    } = useAPI();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    // Estado para el modal de detalle del post-it
    const [detailModalState, setDetailModalState] = useState({ 
        isVisible: false, 
        feedback: null 
    });

    const handleSaveFeedback = (formData) => {
        addFeedback(formData);
    };

    const handleToggleModal = () => setIsModalOpen(prev => !prev);
    const handleToggleManagementModal = () => {
        if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsManagementOpen(prev => !prev);
    };
    
    const handleLogin = async (email, password) => {
        await loginAsAdmin(email, password);
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
            <div className="min-h-screen p-6 font-sans bg-cover bg-fixed"
                style={{ 
                    backgroundImage: `url('https://placehold.co/1920x1080/2f5b40/fff?text=Pizarra+Verde')`, 
                    backgroundBlendMode: 'multiply', 
                    backgroundColor: '#2f5b40' 
                }}>
                <ErrorDisplay error={error} onRetry={clearError} />
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen p-6 font-sans bg-cover bg-fixed"
            style={{ 
                backgroundImage: `url('https://placehold.co/1920x1080/2f5b40/fff?text=Pizarra+Verde')`, 
                backgroundBlendMode: 'multiply', 
                backgroundColor: '#2f5b40' 
            }}
        >
            {/* Estilo CSS para el scrollbar personalizado */}
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                        height: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background-color: transparent;
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.4);
                    }
                `}
            </style>
            
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
            <LoginModal
                isVisible={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleLogin}
            />
            
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
