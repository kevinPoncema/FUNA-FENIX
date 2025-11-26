import React, { useMemo, useState, useEffect } from 'react';
import { X, ThumbsUp, User, Lightbulb, ZoomIn, TrendingUp } from 'lucide-react';

/**
 * Componente para una única nota Post-it
 */
const PostItNote = ({ feedback, colorClass, onDelete, isAuthor, onOpenDetail, webSocketFeedbackIds }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [justCreated, setJustCreated] = useState(false);

    // Detectar si es un feedback recién creado localmente
    useEffect(() => {
        const now = Date.now();
        const createdAt = new Date(feedback.created_at).getTime();
        const isNew = now - createdAt < 2000; // Si fue creado hace menos de 2 segundos
        
        if (isNew) {
            setJustCreated(true);
            // Quitar la animación después de 500ms
            const timer = setTimeout(() => setJustCreated(false), 500);
            return () => clearTimeout(timer);
        }
    }, [feedback.created_at]);

    // Verificar si tiene animaciones WebSocket
    const isNewFromWebSocket = webSocketFeedbackIds?.new?.has(feedback.id) || false;
    const isDeletingFromWebSocket = webSocketFeedbackIds?.deleting?.has(feedback.id) || false;

    const getCategoryInfo = (category) => {
        switch(category) {
            case 'achievements':
                return { icon: ThumbsUp, label: 'Logros' };
            case 'qualities':
                return { icon: User, label: 'Cualidades' };
            case 'potential':
                return { icon: TrendingUp, label: 'Potencial' };
            default:
                return { icon: Lightbulb, label: 'Feedback' };
        }
    };

    const categoryInfo = getCategoryInfo(feedback.category);
    const Icon = categoryInfo.icon;
    
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
            className={`relative p-3 shadow-lg rounded-sm transform cursor-pointer ${colorClass} w-40 h-44 flex flex-col justify-between ${animationClasses}`} 
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div 
                className="absolute inset-0 z-10 p-3 flex flex-col justify-between"
                onClick={() => onOpenDetail(feedback)}
            >
                <p className="text-sm font-bold mb-1 italic opacity-90 flex items-center gap-1 text-gray-800 border-b border-gray-400/50 pb-0.5">
                    <Icon size={14} className="text-gray-800" />
                    {categoryInfo.label}
                </p>
                
                {/* Título del Post-it */}
                <h5 className="text-lg font-extrabold text-gray-900 mb-1 leading-tight overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {feedback.title}
                </h5>

                {/* Contenido con scroll */}
                <p className="text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar h-full pr-1"> 
                    {feedback.text}
                </p> 
            </div>

            {isAuthor && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`absolute -top-1 -right-1 p-0.5 rounded-full text-white transition shadow-md z-20 ${
                        isDeleting 
                            ? 'bg-red-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title="Eliminar mi post-it"
                >
                    <X size={10} />
                </button>
            )}

            {/* Ícono de Zoom */}
            <ZoomIn size={14} className="absolute bottom-1 right-1 text-gray-500 opacity-60 z-0"/>
        </div>
    );
};

export default PostItNote;
