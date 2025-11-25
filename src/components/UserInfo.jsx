import React from 'react';

/**
 * Componente para mostrar información del usuario
 */
const UserInfo = ({ userId }) => {
    return (
        <div className="fixed top-2 right-2 text-xs text-gray-200 bg-black/50 p-2 rounded-lg shadow-md z-40">
            Tu ID de Usuario (Autor): <span className="font-mono text-cyan-300">{userId}</span>
        </div>
    );
};

export default UserInfo;
