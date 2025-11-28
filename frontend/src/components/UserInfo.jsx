import React from 'react';

/**
 * Componente para mostrar información del usuario
 */
const UserInfo = ({ user, originalUserName, onLogout }) => {
    if (!user) return null;

    // Determinar qué nombre mostrar
    const displayName = user.role === 'guest' && originalUserName 
        ? originalUserName 
        : user.name;

    return (
        <div className="fixed top-2 right-2 text-xs text-gray-200 bg-black/50 p-2 rounded-lg shadow-md z-40">
            <div className="flex items-center gap-2">
                <div>
                    <span className="font-medium">{displayName}</span>
                    <span className="text-cyan-300 ml-1">({user.role})</span>
                </div>
                {onLogout && (
                    <button 
                        onClick={onLogout}
                        className="ml-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
                        title="Logout"
                    >
                        Exit
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
