import React, { useState } from 'react';

const AuthenticationModal = ({ isVisible, onClose, onLoginAsAdmin, onLoginAsGuest, authMode }) => {
    const [currentMode, setCurrentMode] = useState(authMode || 'choice');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [guestName, setGuestName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setGuestName('');
        setError('');
        setCurrentMode(authMode || 'choice');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onLoginAsAdmin(email, password);
            resetForm();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onLoginAsGuest(guestName || null);
            resetForm();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                {/* Botón de cerrar solo si no es el modo de selección inicial */}
                {authMode && (
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleClose}
                            className="text-red-500 hover:text-red-700 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Pantalla de selección */}
                {currentMode === 'choice' && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Acceso al Sistema</h2>
                        <p className="text-gray-600 mb-8">Seleccione cómo desea acceder:</p>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => setCurrentMode('admin')}
                                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                disabled={isLoading}
                            >
                                👨‍💼 Acceder como Administrador
                            </button>
                            
                            <button
                                onClick={() => setCurrentMode('guest')}
                                className="w-full py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                disabled={isLoading}
                            >
                                👥 Acceder como Invitado
                            </button>
                        </div>
                    </div>
                )}

                {/* Formulario de Admin */}
                {currentMode === 'admin' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Login de Administrador</h2>
                            {!authMode && (
                                <button 
                                    onClick={() => setCurrentMode('choice')}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ← Volver
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleAdminSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                                    required
                                    disabled={isLoading}
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="mb-4 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Formulario de Invitado */}
                {currentMode === 'guest' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Acceso de Invitado</h2>
                            {!authMode && (
                                <button 
                                    onClick={() => setCurrentMode('choice')}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ← Volver
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleGuestSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Nombre (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-gray-900 bg-white"
                                    disabled={isLoading}
                                    placeholder="Tu nombre..."
                                />
                                <p className="text-gray-500 text-sm mt-2">
                                    Como invitado puedes ver y dar feedback, pero no gestionar miembros del equipo.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Accediendo...' : 'Acceder como Invitado'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthenticationModal;