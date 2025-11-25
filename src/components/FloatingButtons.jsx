import React from 'react';
import { Send, Settings } from 'lucide-react';

/**
 * Componente de botones flotantes
 */
const FloatingButtons = ({ onOpenFeedbackModal, onOpenManagementModal }) => {
    return (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            
            {/* Botón para Administrar Equipo */}
            <button
                onClick={onOpenManagementModal}
                className="flex items-center gap-3 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white text-lg font-bold transition duration-300 shadow-2xl shadow-indigo-500/50 transform hover:scale-105"
                title="Administrar los miembros del equipo"
            >
                <Settings size={20} /> Administrar Equipo
            </button>

            {/* Botón para Añadir Post-it */}
            <button
                onClick={onOpenFeedbackModal}
                className="flex items-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white text-xl font-bold transition duration-300 shadow-2xl shadow-green-500/50 transform hover:scale-105"
                title="Añadir un nuevo post-it"
            >
                <Send size={24} /> Añadir Post-it
            </button>
        </div>
    );
};

export default FloatingButtons;
