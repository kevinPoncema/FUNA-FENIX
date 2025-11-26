import React, { useMemo, useState, useEffect } from 'react';
import { ThumbsUp, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import PostItNote from './PostItNote.jsx';

/**
 * Componente para la Tarjeta/Fila de un Miembro
 */
const MemberRow = ({ member, feedbackData, currentUserId, deleteFeedback, onOpenDetail, webSocketFeedbackIds }) => {
    const [justCreated, setJustCreated] = useState(false);

    // Detectar si es un miembro recién creado
    useEffect(() => {
        const now = Date.now();
        const createdAt = new Date(member.created_at).getTime();
        const isNew = now - createdAt < 3000; // Si fue creado hace menos de 3 segundos
        
        if (isNew) {
            setJustCreated(true);
            // Quitar la animación después de 1 segundo
            const timer = setTimeout(() => setJustCreated(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [member.created_at]);

    const categories = [
        { 
            id: 'achievements', 
            title: 'Logros', 
            icon: ThumbsUp, 
            color: 'bg-green-300', 
            filter: 'achievements' 
        },
        { 
            id: 'qualities', 
            title: 'Cualidades', 
            icon: AlertTriangle, 
            color: 'bg-blue-300', 
            filter: 'qualities' 
        },
        { 
            id: 'potential', 
            title: 'Potencial', 
            icon: TrendingUp, 
            color: 'bg-yellow-300', 
            filter: 'potential' 
        },
    ];

    // Agrupamos el feedback por categoría para esta persona
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
            <div className="w-full lg:w-48 flex flex-row lg:flex-col items-center justify-start lg:justify-center p-2 pt-4 flex-shrink-0 gap-4 lg:gap-0">
                <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-indigo-500/80 text-white flex items-center justify-center text-xl lg:text-2xl font-extrabold border-2 border-white shadow-xl transition-all duration-300 ${
                    justCreated ? 'ring-4 ring-purple-400 ring-opacity-75' : ''
                }`}>
                    {member.name.charAt(0)}
                </div>
                <div className="text-left lg:text-center">
                    <h3 className="text-sm lg:text-base font-bold text-white mt-0 lg:mt-2">{member.name}</h3>
                    <p className="text-xs text-indigo-300">({member.role})</p>
                    {justCreated && (
                        <p className="text-xs text-purple-300 mt-1 animate-bounce">¡Nuevo!</p>
                    )}
                </div>
            </div>

            {/* Columnas de Feedback (Derecha) */}
            <div className="flex flex-1 gap-2 lg:gap-4 pt-4 min-h-[100px] overflow-x-auto pb-2 w-full">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-3 min-w-[140px] lg:min-w-[200px] flex-1 border-l border-white/10 pl-2 lg:pl-4">
                        {/* Título de la Categoría */}
                        <h4 className="text-xs lg:text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-1">
                            <cat.icon size={12} lg:size={14} className="text-white" /> 
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

export default MemberRow;
