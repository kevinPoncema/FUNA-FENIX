import React, { useMemo, useState, useEffect } from 'react';
import { X, ThumbsUp, User, Lightbulb, ZoomIn, TrendingUp, Trash2 } from 'lucide-react';

/**
 * Componente para una única nota Post-it
 */
const PostItNote = ({ feedback, colorClass, onDelete, isAuthor, onOpenDetail, webSocketFeedbackIds }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [justCreated, setJustCreated] = useState(false);

    // Función para truncar texto
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

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
            className={`relative p-3 md:p-4 shadow-xl rounded-lg transform cursor-pointer ${colorClass} w-40 h-44 md:w-48 md:h-52 lg:w-52 lg:h-56 flex flex-col ${animationClasses}`} 
            style={{ 
                transform: `rotate(${rotation}deg)`,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            }}
        >
            {/* Botón X rojo en la esquina superior derecha */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`absolute top-2 right-2 w-6 h-6 rounded-full transition-all duration-200 z-20 flex items-center justify-center ${
                    isDeleting 
                        ? 'bg-red-300 cursor-not-allowed scale-90' 
                        : 'bg-red-500 hover:bg-red-600 hover:scale-110 active:scale-95'
                }`}
                title="Eliminar post-it"
            >
                <X size={12} className="text-white font-bold" />
            </button>

            <div 
                className="flex flex-col h-full p-1 z-10"
                onClick={() => onOpenDetail(feedback)}
            >
                {/* Header con categoría */}
                <div className="flex items-center gap-1 border-b border-black/20 pb-2 mb-3">
                    <Icon size={14} />
                    <span className="text-xs font-bold opacity-80 hidden sm:inline truncate">{categoryInfo.label}</span>
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
            <ZoomIn size={14} className="absolute bottom-2 right-2 opacity-40 z-0"/>
        </div>
    );
};

export default PostItNote;
