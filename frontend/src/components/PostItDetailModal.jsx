import React, { useMemo } from 'react';
import { X, ThumbsUp, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

/**
 * Componente Modal para mostrar el contenido completo del Post-it
 */
const PostItDetailModal = ({ isVisible, onClose, feedback, members }) => {
    if (!isVisible || !feedback) return null;

    const targetMember = members.find(m => m.id === feedback.target_id);
    
    const categoryDetails = useMemo(() => {
        const categories = {
            achievements: { 
                title: 'Logros', 
                icon: ThumbsUp, 
                color: 'text-green-600', 
                bg: 'bg-green-100' 
            },
            qualities: { 
                title: 'Cualidades', 
                icon: AlertTriangle, 
                color: 'text-blue-600', 
                bg: 'bg-blue-100' 
            },
            potential: { 
                title: 'Potencial', 
                icon: TrendingUp, 
                color: 'text-yellow-600', 
                bg: 'bg-yellow-100' 
            },
        };
        return categories[feedback.category] || { 
            title: 'Feedback', 
            icon: Lightbulb, 
            color: 'text-gray-600', 
            bg: 'bg-gray-100' 
        };
    }, [feedback.category]);

    const Icon = categoryDetails.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-400 transform scale-100 transition-transform duration-300 ${categoryDetails.bg}`}>
                <div className="flex justify-between items-start border-b border-gray-400 pb-3 mb-4">
                    <h3 className={`text-2xl font-extrabold flex items-center gap-2 ${categoryDetails.color}`}>
                        <Icon size={28} /> {categoryDetails.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Título del Post-it */}
                <h4 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                    {feedback.title}
                </h4>

                {/* Área de Contenido con Scroll */}
                <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-300 mb-4 h-60 overflow-y-auto custom-scrollbar">
                    <p className="font-mono whitespace-pre-wrap text-gray-800 text-lg">
                        {feedback.text}
                    </p>
                </div>

                <div className="text-sm text-gray-700 mt-2">
                    <p><strong>Dirigido a:</strong> {targetMember ? targetMember.name : 'Miembro Desconocido'}</p>
                </div>

                <button onClick={onClose} className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition">
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default PostItDetailModal;
