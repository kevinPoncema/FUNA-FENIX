import React, { useMemo } from 'react';
import { Zap, User, ChevronsUp } from 'lucide-react';
import PostItNote from './PostItNote.jsx';

/**
 * Componente para la Tarjeta/Fila de un Miembro
 */
const MemberRow = ({ member, feedbackData, currentUserId, deleteFeedback, onOpenDetail }) => {
    const categories = [
        { 
            id: 'achievements', 
            title: 'Logros Destacados', 
            icon: Zap, 
            color: 'bg-green-300', 
            filter: 'achievements' 
        },
        { 
            id: 'qualities', 
            title: 'Cualidades Esenciales', 
            icon: User, 
            color: 'bg-yellow-200', 
            filter: 'qualities' 
        },
        { 
            id: 'potential', 
            title: 'Puntos de Potencial', 
            icon: ChevronsUp, 
            color: 'bg-cyan-300', 
            filter: 'potential' 
        },
    ];

    // Agrupamos el feedback por categoría para esta persona
    const feedbackByCategory = useMemo(() => {
        const grouped = { achievements: [], qualities: [], potential: [] };
        feedbackData
            .filter(f => f.targetId === member.id)
            .forEach(f => {
                if (grouped[f.category]) {
                    grouped[f.category].push(f);
                }
            });
        return grouped;
    }, [feedbackData, member.id]);

    return (
        <div className="flex border-b border-white/10 py-4 items-start gap-4 hover:bg-black/20 transition duration-150">
            
            {/* Columna de Miembro (Izquierda) */}
            <div className="w-40 flex flex-col items-center justify-center p-2 pt-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-indigo-500/80 text-white flex items-center justify-center text-2xl font-extrabold border-2 border-white shadow-xl">
                    {member.name.charAt(0)}
                </div>
                <h3 className="text-base font-bold text-white mt-2 text-center">{member.name}</h3>
                <p className="text-xs text-indigo-300 text-center">({member.role})</p>
            </div>

            {/* Columnas de Feedback (Derecha) */}
            <div className="flex flex-grow gap-4 pt-4 min-h-[100px] overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-3 min-w-[150px] border-l border-white/10 pl-4">
                        {/* Título de la Categoría */}
                        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-1">
                            <cat.icon size={14} className="text-white" /> 
                            {cat.title}
                        </h4>

                        {/* Post-its de la Categoría */}
                        <div className="flex gap-4">
                            {feedbackByCategory[cat.filter].length > 0 ? (
                                feedbackByCategory[cat.filter].map((feedback) => (
                                    <PostItNote
                                        key={feedback.id}
                                        feedback={feedback}
                                        colorClass={cat.color}
                                        isAuthor={feedback.authorId === currentUserId}
                                        onDelete={deleteFeedback}
                                        onOpenDetail={onOpenDetail}
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
