# 🧩 Components & State Management - FUNA FENIX Frontend

## Descripción General

El frontend de FUNA FENIX utiliza una arquitectura de componentes React con gestión de estado a través de hooks nativos. La aplicación sigue un patrón de composición de componentes y lifting state up para compartir estado entre componentes hermanos.

## Arquitectura de Componentes

### Jerarquía de Componentes

```
App (Estado principal)
├── UserInfo (Información del usuario)
├── Header (Título de la aplicación)
├── FloatingButtons (Botones de acción)
├── MainBoard (Tablero principal)
│   └── MemberRow[] (Filas de miembros)
│       └── PostItNote[] (Notas individuales)
├── AuthenticationModal (Modal de login)
│   ├── LoginModal (Login específico)
│   └── ErrorDisplay (Errores de auth)
├── FeedbackFormModal (Modal para crear feedback)
├── MemberManagementModal (Modal para gestión de equipo)
├── PostItDetailModal (Modal de detalle de feedback)
└── Loading (Estado de carga)
```

## Gestión de Estado

### Estado Principal (App.jsx)

El componente App mantiene el estado global de la aplicación:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAPI } from './api/useAPI.js';

const App = () => {
    // ===== ESTADO DE AUTENTICACIÓN =====
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState(null);

    // ===== ESTADO DE DATOS =====
    const [teamMembers, setTeamMembers] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);

    // ===== ESTADO DE UI =====
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

    // ===== ESTADO DE MODALES =====
    const [detailModalState, setDetailModalState] = useState({
        isVisible: false,
        feedback: null
    });

    // ===== ESTADO DE WEBSOCKET =====
    const [webSocketFeedbackIds, setWebSocketFeedbackIds] = useState({
        new: new Set(),
        deleting: new Set()
    });

    // Hook personalizado para API y WebSocket
    const {
        login,
        logout,
        fetchTeamMembersWithFeedbacks,
        createFeedback,
        deleteFeedback,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        // Eventos WebSocket
        onFeedbackCreated,
        onFeedbackDeleted,
        onTeamMemberCreated,
        onTeamMemberUpdated,
        onTeamMemberDeleted,
    } = useAPI();

    // ... resto de la lógica del componente
};
```

### Custom Hook - useAPI

El hook `useAPI` encapsula toda la lógica de comunicación con el backend:

```jsx
import { useState, useEffect, useCallback } from 'react';
import apiService from './apiService.js';
import echo from './echo.js';

export const useAPI = () => {
    // ===== ESTADO INTERNO =====
    const [isInitialized, setIsInitialized] = useState(false);
    const [wsConnection, setWsConnection] = useState(null);

    // ===== FUNCIONES DE AUTENTICACIÓN =====
    const login = useCallback(async (credentials, mode = 'admin') => {
        try {
            let result;
            if (mode === 'admin') {
                result = await apiService.loginAdmin(credentials.email, credentials.password);
            } else {
                result = await apiService.loginGuest(credentials.name, credentials.hash);
            }
            
            // Actualizar estado de autenticación
            return {
                success: true,
                user: result.user,
                token: result.token
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Error de autenticación'
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Limpiar estado local
            apiService.clearAuth();
        }
    }, []);

    // ===== FUNCIONES DE DATOS =====
    const fetchTeamMembersWithFeedbacks = useCallback(async () => {
        try {
            const data = await apiService.getTeamMembersWithFeedbacks();
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching team members:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const createFeedback = useCallback(async (feedbackData) => {
        try {
            const feedback = await apiService.createFeedback(feedbackData);
            return { success: true, data: feedback };
        } catch (error) {
            console.error('Error creating feedback:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const deleteFeedback = useCallback(async (feedbackId) => {
        try {
            await apiService.deleteFeedback(feedbackId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting feedback:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // ===== CONFIGURACIÓN DE WEBSOCKET =====
    useEffect(() => {
        if (!isInitialized && apiService.token) {
            setupWebSocketListeners();
            setIsInitialized(true);
        }

        return () => {
            if (wsConnection) {
                cleanupWebSocketListeners();
            }
        };
    }, [isInitialized]);

    const setupWebSocketListeners = () => {
        try {
            // Configurar echo con token de autenticación
            echo.connector.pusher.config.auth = {
                headers: {
                    'Authorization': `Bearer ${apiService.token}`
                }
            };

            // Escuchar canal de feedback updates
            const channel = echo.channel('feedback-updates');
            
            channel.listen('.feedback.created', handleFeedbackCreated);
            channel.listen('.feedback.updated', handleFeedbackUpdated);  
            channel.listen('.feedback.deleted', handleFeedbackDeleted);

            // Escuchar canal de team updates
            const teamChannel = echo.channel('team-updates');
            
            teamChannel.listen('.team-member.created', handleTeamMemberCreated);
            teamChannel.listen('.team-member.updated', handleTeamMemberUpdated);
            teamChannel.listen('.team-member.deleted', handleTeamMemberDeleted);

            setWsConnection({ channel, teamChannel });

            console.log('✅ WebSocket listeners configurados');
        } catch (error) {
            console.error('❌ Error configurando WebSocket:', error);
        }
    };

    // ===== HANDLERS DE WEBSOCKET =====
    const handleFeedbackCreated = useCallback((event) => {
        console.log('📢 Feedback created via WebSocket:', event);
        if (onFeedbackCreated) {
            onFeedbackCreated(event.feedback);
        }
    }, []);

    const handleFeedbackDeleted = useCallback((event) => {
        console.log('📢 Feedback deleted via WebSocket:', event);
        if (onFeedbackDeleted) {
            onFeedbackDeleted(event.feedbackId);
        }
    }, []);

    // ... más handlers

    return {
        // Funciones de autenticación
        login,
        logout,
        
        // Funciones de datos
        fetchTeamMembersWithFeedbacks,
        createFeedback,
        deleteFeedback,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        
        // Callbacks para WebSocket events
        onFeedbackCreated: null, // Se asignan desde App
        onFeedbackDeleted: null,
        onTeamMemberCreated: null,
        onTeamMemberUpdated: null,
        onTeamMemberDeleted: null,
    };
};
```

## Componentes Principales

### 1. App.jsx (Root Component)

Componente raíz que maneja el estado global y la lógica principal:

```jsx
const App = () => {
    // Estado y hooks...

    // ===== EFECTOS =====
    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadInitialData();
            setupWebSocketCallbacks();
        }
    }, [isAuthenticated]);

    // ===== FUNCIONES DE INICIALIZACIÓN =====
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                setUser(user);
                setIsAuthenticated(true);
                apiService.token = token;
                apiService.user = user;
            } catch (error) {
                console.error('Error parsing user data:', error);
                handleLogout();
            }
        }
        setIsLoading(false);
    };

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchTeamMembersWithFeedbacks();
            if (result.success) {
                setTeamMembers(result.data);
                
                // Extraer feedbacks de todos los miembros
                const allFeedbacks = result.data.flatMap(member => 
                    (member.feedbacks || []).map(feedback => ({
                        ...feedback,
                        target_id: member.id
                    }))
                );
                setFeedbackData(allFeedbacks);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ===== HANDLERS DE WEBSOCKET =====
    const setupWebSocketCallbacks = () => {
        // Asignar callbacks al hook useAPI
        useAPI.onFeedbackCreated = handleWebSocketFeedbackCreated;
        useAPI.onFeedbackDeleted = handleWebSocketFeedbackDeleted;
        useAPI.onTeamMemberCreated = handleWebSocketTeamMemberCreated;
        // ... más callbacks
    };

    const handleWebSocketFeedbackCreated = useCallback((feedback) => {
        setFeedbackData(prev => [...prev, feedback]);
        
        // Animación temporal
        setWebSocketFeedbackIds(prev => ({
            ...prev,
            new: new Set([...prev.new, feedback.id])
        }));
        
        setTimeout(() => {
            setWebSocketFeedbackIds(prev => ({
                ...prev,
                new: new Set([...prev.new].filter(id => id !== feedback.id))
            }));
        }, 2000);
    }, []);

    // ===== HANDLERS DE UI =====
    const handleLoginSuccess = useCallback((userData) => {
        setUser(userData.user);
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
        setAuthMode(null);
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsAuthenticated(false);
        setTeamMembers([]);
        setFeedbackData([]);
        setWebSocketFeedbackIds({ new: new Set(), deleting: new Set() });
    };

    // ===== RENDER =====
    if (isLoading) {
        return <Loading message="Cargando aplicación..." />;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <AuthenticationModal 
                    isOpen={true}
                    onLoginSuccess={handleLoginSuccess}
                    authMode={authMode}
                />
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';
    const userId = user?.id;

    return (
        <div className="app-container">
            <UserInfo user={user} onLogout={handleLogout} />
            <Header />
            <FloatingButtons 
                onOpenFeedbackModal={handleToggleFeedbackModal}
                onOpenManagementModal={handleToggleManagementModal}
                isAdmin={isAdmin}
            />
            <MainBoard 
                teamMembers={teamMembers}
                feedbackData={feedbackData}
                userId={userId}
                deleteFeedback={handleDeleteFeedback}
                onOpenDetail={handleOpenDetailModal}
                webSocketFeedbackIds={webSocketFeedbackIds}
            />
            
            {/* Modales */}
            {isFeedbackModalOpen && (
                <FeedbackFormModal
                    isOpen={isFeedbackModalOpen}
                    onClose={handleToggleFeedbackModal}
                    teamMembers={teamMembers}
                    onSubmit={handleCreateFeedback}
                />
            )}
            
            {isManagementModalOpen && isAdmin && (
                <MemberManagementModal
                    isOpen={isManagementModalOpen}
                    onClose={handleToggleManagementModal}
                    teamMembers={teamMembers}
                    onCreateMember={handleCreateTeamMember}
                    onUpdateMember={handleUpdateTeamMember}
                    onDeleteMember={handleDeleteTeamMember}
                />
            )}
            
            {detailModalState.isVisible && (
                <PostItDetailModal
                    feedback={detailModalState.feedback}
                    isOpen={detailModalState.isVisible}
                    onClose={handleCloseDetailModal}
                />
            )}
        </div>
    );
};
```

### 2. MainBoard.jsx (Main Display Component)

Componente principal que muestra el tablero de retroalimentación:

```jsx
import React from 'react';
import { Users } from 'lucide-react';
import MemberRow from './MemberRow.jsx';

const MainBoard = ({ 
    teamMembers, 
    feedbackData, 
    userId, 
    deleteFeedback, 
    onOpenDetail, 
    webSocketFeedbackIds 
}) => {
    return (
        <main className="board-container">
            {teamMembers.length > 0 ? (
                <div className="w-full">
                    {teamMembers.map((member) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            feedbackData={feedbackData}
                            currentUserId={userId}
                            deleteFeedback={deleteFeedback}
                            onOpenDetail={onOpenDetail}
                            webSocketFeedbackIds={webSocketFeedbackIds}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 text-white/70">
                    <Users size={48} className="mx-auto mb-4 text-white/50"/>
                    <p className="text-xl font-semibold">No hay miembros registrados.</p>
                    <p className="text-base mt-2">Usa el botón "Administrar Equipo" para empezar a agregar personas.</p>
                </div>
            )}
        </main>
    );
};

export default MainBoard;
```

### 3. MemberRow.jsx (Member Display Component)

Componente que muestra una fila de miembro con sus feedbacks:

```jsx
import React, { useMemo, useEffect, useState } from 'react';
import { ThumbsUp, User, TrendingUp } from 'lucide-react';
import PostItNote from './PostItNote.jsx';

const MemberRow = ({ 
    member, 
    feedbackData, 
    currentUserId, 
    deleteFeedback, 
    onOpenDetail, 
    webSocketFeedbackIds 
}) => {
    const [justCreated, setJustCreated] = useState(false);

    // Detectar si es un miembro recién creado
    useEffect(() => {
        const now = Date.now();
        const createdAt = new Date(member.created_at).getTime();
        const isNew = now - createdAt < 2000;
        
        if (isNew) {
            setJustCreated(true);
            const timer = setTimeout(() => setJustCreated(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [member.created_at]);

    // Configuración de categorías
    const categories = [
        { 
            id: 'achievements', 
            title: 'Logros', 
            icon: ThumbsUp, 
            color: 'bg-green-200',
            filter: 'achievements'
        },
        { 
            id: 'qualities', 
            title: 'Cualidades', 
            icon: User, 
            color: 'bg-blue-200',
            filter: 'qualities'
        },
        { 
            id: 'potential', 
            title: 'Potencial', 
            icon: TrendingUp, 
            color: 'bg-purple-200',
            filter: 'potential'
        }
    ];

    // Agrupar feedbacks por categoría usando useMemo para optimización
    const feedbackByCategory = useMemo(() => {
        const grouped = { achievements: [], qualities: [], potential: [] };
        feedbackData
            .filter(f => f.target_id === member.id)
            .forEach(f => {
                if (grouped[f.category]) {
                    grouped[f.category].push(f);
                }
            });
        return grouped;
    }, [feedbackData, member.id]);

    // Clases de animación para nuevos miembros
    const memberAnimationClasses = justCreated 
        ? 'animate-pulse bg-purple-900/40 border-l-4 border-purple-400 scale-105' 
        : '';

    return (
        <div className={`flex flex-col lg:flex-row border-b border-white/10 py-4 items-start gap-4 hover:bg-black/20 transition-all duration-300 w-full ${memberAnimationClasses}`}>
            
            {/* Columna de Miembro (Izquierda) */}
            <div className="w-full lg:w-48 flex flex-row lg:flex-col items-center justify-start lg:justify-center p-4 flex-shrink-0 gap-4 lg:gap-0">
                <div className={`member-avatar w-16 h-16 lg:w-20 lg:h-20 rounded-full text-white flex items-center justify-center text-xl lg:text-2xl font-extrabold transition-all duration-300 ${
                    justCreated ? 'ring-4 ring-purple-400 ring-opacity-75 animate-pulse' : ''
                }`}>
                    {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left lg:text-center">
                    <h3 className="text-base lg:text-lg font-bold text-white mt-0 lg:mt-3">{member.name}</h3>
                    <p className="text-sm text-white/70 font-medium">({member.role})</p>
                    {justCreated && (
                        <p className="text-xs text-purple-300 mt-1 animate-bounce font-semibold">¡Nuevo!</p>
                    )}
                </div>
            </div>

            {/* Columnas de Feedback (Derecha) */}
            <div className="flex flex-1 gap-2 lg:gap-4 pt-4 min-h-[100px] overflow-x-auto pb-2 w-full">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-3 min-w-[140px] lg:min-w-[200px] flex-1 border-l border-white/10 pl-2 lg:pl-4">
                        {/* Título de la Categoría */}
                        <h4 className="text-xs lg:text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-1">
                            <span className="text-sm">{cat.title === 'Logros' ? '👍' : cat.title === 'Cualidades' ? '👤' : '📈'}</span>
                            <span className="hidden sm:inline">{cat.title}</span>
                            <span className="sm:hidden">{cat.title.substring(0, 3)}</span>
                        </h4>

                        {/* Post-its de la Categoría */}
                        <div className="flex gap-2 lg:gap-4 flex-wrap">
                            {feedbackByCategory[cat.filter].length > 0 ? (
                                feedbackByCategory[cat.filter].map((feedback) => (
                                    <PostItNote
                                        key={feedback.id}
                                        feedback={feedback}
                                        colorClass={cat.color}
                                        isAuthor={feedback.owner_id === currentUserId}
                                        onDelete={deleteFeedback}
                                        onOpenDetail={onOpenDetail}
                                        webSocketFeedbackIds={webSocketFeedbackIds}
                                    />
                                ))
                            ) : (
                                <p className="text-xs italic text-white/30 pt-2">Añade feedback...</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(MemberRow); // Memoización para optimizar re-renders
```

### 4. PostItNote.jsx (Individual Note Component)

Componente para cada nota individual de feedback:

```jsx
import React, { useMemo, useState, useEffect } from 'react';

const PostItNote = ({ 
    feedback, 
    colorClass, 
    onDelete, 
    isAuthor, 
    onOpenDetail, 
    webSocketFeedbackIds 
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [justCreated, setJustCreated] = useState(false);

    // Obtener información del usuario actual para verificar si es admin
    const currentUser = JSON.parse(localStorage.getItem('user')) || null;
    
    // Verificar si puede eliminar: es el autor O es admin
    const canDelete = isAuthor || (currentUser && currentUser.role === 'admin');

    // Función para truncar texto
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Detectar si es un feedback recién creado localmente
    useEffect(() => {
        const now = Date.now();
        const createdAt = new Date(feedback.created_at).getTime();
        const isNew = now - createdAt < 2000;
        
        if (isNew) {
            setJustCreated(true);
            const timer = setTimeout(() => setJustCreated(false), 500);
            return () => clearTimeout(timer);
        }
    }, [feedback.created_at]);

    // Verificar si tiene animaciones WebSocket
    const isNewFromWebSocket = webSocketFeedbackIds?.new?.has(feedback.id) || false;
    const isDeletingFromWebSocket = webSocketFeedbackIds?.deleting?.has(feedback.id) || false;

    // Rotación aleatoria para efecto post-it
    const rotation = useMemo(() => {
        const min = -1;
        const max = 1;
        return Math.random() * (max - min) + min;
    }, []);

    const handleDelete = async (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        
        // Esperar la animación antes de llamar onDelete
        setTimeout(() => {
            onDelete(feedback.id);
        }, 300);
    };

    // Clases de animación
    const animationClasses = `
        ${justCreated ? 'animate-bounce scale-110' : ''}
        ${isNewFromWebSocket ? 'animate-pulse scale-110 ring-2 ring-blue-400' : ''}
        ${isDeleting || isDeletingFromWebSocket ? 'animate-pulse scale-75 opacity-30' : ''}
        transition-all duration-300 ease-in-out
    `;

    return (
        <div 
            className={`relative p-3 md:p-4 shadow-xl rounded-lg transform cursor-pointer ${colorClass} w-40 h-44 md:w-48 md:h-52 lg:w-52 lg:h-56 flex flex-col ${animationClasses}`} 
            style={{ 
                transform: `rotate(${rotation}deg)`,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            }}
        >
            {/* Botón de eliminar compacto - Solo visible para el autor o admin */}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`absolute top-2 right-2 w-6 h-6 text-sm font-bold rounded-full transition-all duration-200 z-20 flex items-center justify-center shadow-sm ${
                        isDeleting 
                            ? 'bg-red-300 text-red-700 cursor-not-allowed scale-90' 
                            : 'bg-red-500 text-white hover:bg-red-600 hover:scale-110 active:scale-95'
                    }`}
                    title="Eliminar este post-it permanentemente"
                >
                    ×
                </button>
            )}

            <div 
                className="flex flex-col h-full p-1 z-10"
                onClick={() => onOpenDetail(feedback)}
            >
                {/* Header con categoría */}
                <div className="flex items-center gap-1 border-b border-black/20 pb-2 mb-3">
                    <span className="text-sm">
                        {feedback.category === 'achievements' ? '👍' : 
                         feedback.category === 'qualities' ? '👤' : '📈'}
                    </span>
                    <span className="text-xs font-bold opacity-80 hidden sm:inline truncate">
                        {feedback.category === 'achievements' ? 'Logros' : 
                         feedback.category === 'qualities' ? 'Cualidades' : 'Potencial'}
                    </span>
                </div>
                
                {/* Título del Post-it */}
                <h5 className="text-sm md:text-base font-extrabold leading-tight mb-3">
                    {truncateText(feedback.title, 30)}
                </h5>

                {/* Contenido limitado */}
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs md:text-sm leading-relaxed line-clamp-4 break-words"> 
                        {truncateText(feedback.text, 80)}
                    </p>
                </div>
            </div>

            {/* Ícono de Zoom */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-black bg-opacity-20 rounded-full flex items-center justify-center text-xs text-white opacity-40 z-0">
                +
            </div>
        </div>
    );
};

export default React.memo(PostItNote);
```

### 5. Modal Components

#### AuthenticationModal.jsx

```jsx
import React, { useState } from 'react';
import LoginModal from './LoginModal.jsx';
import ErrorDisplay from './ErrorDisplay.jsx';

const AuthenticationModal = ({ isOpen, onLoginSuccess, authMode }) => {
    const [currentMode, setCurrentMode] = useState(authMode || 'choice');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleModeChange = (mode) => {
        setCurrentMode(mode);
        setError('');
    };

    const handleLoginSuccess = (userData) => {
        setError('');
        setIsLoading(false);
        onLoginSuccess(userData);
    };

    const handleLoginError = (errorMessage) => {
        setError(errorMessage);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🔥 FUNA FENIX</h1>
                    <p className="text-gray-600">Plataforma de Retroalimentación de Equipo</p>
                </div>

                {error && (
                    <ErrorDisplay 
                        message={error} 
                        onClose={() => setError('')} 
                    />
                )}

                {currentMode === 'choice' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-gray-700">¿Cómo deseas acceder?</h2>
                        
                        <button
                            onClick={() => handleModeChange('admin')}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            👨‍💼 Acceso Administrador
                        </button>
                        
                        <button
                            onClick={() => handleModeChange('guest')}
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            👤 Acceso Invitado
                        </button>
                    </div>
                )}

                {(currentMode === 'admin' || currentMode === 'guest') && (
                    <LoginModal
                        mode={currentMode}
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                        onBack={() => handleModeChange('choice')}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthenticationModal;
```

## Hooks Personalizados

### useState Patterns

La aplicación utiliza varios patrones de useState:

```jsx
// Estado simple
const [isLoading, setIsLoading] = useState(false);

// Estado de objeto
const [detailModalState, setDetailModalState] = useState({
    isVisible: false,
    feedback: null
});

// Estado de array
const [teamMembers, setTeamMembers] = useState([]);

// Estado complejo con Set para performance
const [webSocketFeedbackIds, setWebSocketFeedbackIds] = useState({
    new: new Set(),
    deleting: new Set()
});
```

### useEffect Patterns

Diferentes patrones de useEffect según el caso de uso:

```jsx
// Efecto de inicialización (equivalente a componentDidMount)
useEffect(() => {
    checkAuthStatus();
}, []); // Array vacío = solo al montar

// Efecto dependiente de estado
useEffect(() => {
    if (isAuthenticated) {
        loadInitialData();
        setupWebSocketCallbacks();
    }
}, [isAuthenticated]); // Se ejecuta cuando cambia isAuthenticated

// Efecto con cleanup (equivalente a componentWillUnmount)
useEffect(() => {
    const cleanup = setupWebSocketListeners();
    
    return () => {
        cleanup(); // Función de limpieza
    };
}, []);

// Efecto temporal para animaciones
useEffect(() => {
    if (justCreated) {
        const timer = setTimeout(() => setJustCreated(false), 2000);
        return () => clearTimeout(timer); // Cleanup del timer
    }
}, [justCreated]);
```

### useCallback for Performance

UseCallback se utiliza para optimizar re-renders:

```jsx
// Función que se pasa como prop y debe ser estable
const handleWebSocketFeedbackCreated = useCallback((feedback) => {
    setFeedbackData(prev => [...prev, feedback]);
    
    // Animación temporal
    setWebSocketFeedbackIds(prev => ({
        ...prev,
        new: new Set([...prev.new, feedback.id])
    }));
    
    setTimeout(() => {
        setWebSocketFeedbackIds(prev => ({
            ...prev,
            new: new Set([...prev.new].filter(id => id !== feedback.id))
        }));
    }, 2000);
}, []); // Array vacío porque no depende de ningún valor

// Función con dependencias
const createFeedback = useCallback(async (feedbackData) => {
    try {
        const feedback = await apiService.createFeedback(feedbackData);
        return { success: true, data: feedback };
    } catch (error) {
        console.error('Error creating feedback:', error);
        return { success: false, error: error.message };
    }
}, []); // Sin dependencias, función estable
```

### useMemo for Expensive Calculations

UseMemo se utiliza para optimizar cálculos costosos:

```jsx
// Agrupar feedbacks por categoría (cálculo costoso)
const feedbackByCategory = useMemo(() => {
    const grouped = { achievements: [], qualities: [], potential: [] };
    feedbackData
        .filter(f => f.target_id === member.id)
        .forEach(f => {
            if (grouped[f.category]) {
                grouped[f.category].push(f);
            }
        });
    return grouped;
}, [feedbackData, member.id]); // Recalcular solo si cambian estos valores

// Valor calculado para efectos visuales
const rotation = useMemo(() => {
    const min = -1;
    const max = 1;
    return Math.random() * (max - min) + min;
}, []); // Calcular solo una vez
```

## Optimizations y Performance

### React.memo

Componentes memoizados para evitar re-renders innecesarios:

```jsx
// Componente memoizado
const PostItNote = React.memo(({ feedback, colorClass, onDelete, isAuthor, onOpenDetail, webSocketFeedbackIds }) => {
    // ... implementación del componente
});

const MemberRow = React.memo(({ member, feedbackData, currentUserId, deleteFeedback, onOpenDetail, webSocketFeedbackIds }) => {
    // ... implementación del componente
});
```

### State Batching

Agrupación de actualizaciones de estado para mejor performance:

```jsx
// Actualización batched en React 18
const handleMultipleUpdates = () => {
    setLoading(true);           // \
    setError('');               //  } Se agrupa en un solo re-render
    setData(newData);           // /
};
```

### Lazy Loading

Carga diferida de componentes pesados:

```jsx
import { lazy, Suspense } from 'react';

// Componente lazy
const HeavyModal = lazy(() => import('./HeavyModal.jsx'));

// Uso con Suspense
{showHeavyModal && (
    <Suspense fallback={<Loading />}>
        <HeavyModal onClose={closeModal} />
    </Suspense>
)}
```

Este sistema de gestión de estado y componentes proporciona una base sólida, escalable y mantenible para el frontend de FUNA FENIX.
