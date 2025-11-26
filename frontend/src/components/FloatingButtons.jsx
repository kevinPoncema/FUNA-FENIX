import React from 'react';
import { Send, Settings, Lock } from 'lucide-react';

/**
 * Componente de botones flotantes
 */
const FloatingButtons = ({ onOpenFeedbackModal, onOpenManagementModal, isAdmin }) => {
    return (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            
            {/* Botón para Administrar Equipo */}
            <button
                onClick={onOpenManagementModal}
                className={`flex items-center gap-3 px-6 py-3 rounded-full text-white text-lg font-bold transition duration-300 shadow-2xl transform hover:scale-105 ${
                    isAdmin 
                        ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/50' 
                        : 'bg-gray-500 hover:bg-gray-600 shadow-gray-500/50'
                }`}
                title={isAdmin ? "Administrar los miembros del equipo" : "Requiere permisos de administrador"}
            >
                {isAdmin ? <Settings size={20} className="text-white" /> : <Lock size={20} className="text-white" />}
                {isAdmin ? 'Administrar Equipo' : 'Admin Required'}
            </button>

            {/* Botón para Añadir Post-it */}
            <button
                onClick={onOpenFeedbackModal}
                className="flex items-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white text-xl font-bold transition duration-300 shadow-2xl shadow-green-500/50 transform hover:scale-105"
                title="Añadir un nuevo post-it"
            >
                <Send size={24} className="text-white" /> Añadir Post-it
            </button>
        </div>
    );
};

export default FloatingButtons;
