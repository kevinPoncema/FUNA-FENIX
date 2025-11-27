import React, { useMemo, useState, useEffect } from 'react';
import { X, ThumbsUp, User, Lightbulb, ZoomIn, TrendingUp, Trash2 } from 'lucide-react';

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
            className={`relative p-3 md:p-4 shadow-xl rounded-lg transform cursor-pointer ${colorClass} w-40 h-44 md:w-48 md:h-52 lg:w-52 lg:h-56 flex flex-col justify-between ${animationClasses}`} 
            style={{ 
                transform: `rotate(${rotation}deg)`,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            }}
        >
            <div 
                className="absolute inset-0 z-10 p-3 md:p-4 flex flex-col justify-between"
                onClick={() => onOpenDetail(feedback)}
            >
                <p className="text-sm md:text-base font-bold mb-2 italic opacity-90 flex items-center gap-1 border-b border-black/20 pb-1">
                    <Icon size={14} md:size={16} />
                    <span className="hidden sm:inline">{categoryInfo.label}</span>
                </p>
                
                {/* Título del Post-it */}
                <h5 className="text-base md:text-xl font-extrabold text-gray-900 mb-2 leading-tight overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {feedback.title}
                </h5>

                {/* Contenido con scroll */}
                <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar h-full pr-1"> 
                    {feedback.text}
                </p> 
            </div>

            {isAuthor && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`absolute -top-3 -right-3 w-8 h-8 text-white transition-all duration-200 shadow-lg z-20 border-2 border-white flex items-center justify-center ${
                        isDeleting 
                            ? 'bg-red-300 cursor-not-allowed scale-90' 
                            : 'bg-red-500 hover:bg-red-600 hover:scale-110 active:scale-95'
                    }`}
                    title="Eliminar mi post-it"
                >
                    <Trash2 size={16} className="text-white" />
                </button>
            )}

            {/* Ícono de Zoom */}
            <ZoomIn size={16} className="absolute bottom-2 right-2 text-gray-500 opacity-60 z-0"/>
        </div>
    );
};

export default PostItNote;
