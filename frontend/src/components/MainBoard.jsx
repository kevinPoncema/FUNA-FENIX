import React from 'react';
import { Users } from 'lucide-react';
import MemberRow from './MemberRow.jsx';

/**
 * Componente principal del tablero
 */
const MainBoard = ({ teamMembers, feedbackData, userId, deleteFeedback, onOpenDetail, webSocketFeedbackIds }) => {
    return (
        <main className="bg-black/40 p-2 md:p-4 rounded-xl shadow-inner border border-white/20 w-full overflow-x-auto">
            {teamMembers.length > 0 ? (
                <div className="w-full">
                    {teamMembers.map((member) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            feedbackData={feedbackData}
                            currentUserId={userId}
                            deleteFeedback={deleteFeedback}
                            onOpenDetail={onOpenDetail}
                            webSocketFeedbackIds={webSocketFeedbackIds}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 text-white/70">
                    <Users size={32} className="mx-auto mb-4"/>
                    <p className="text-lg font-semibold">No hay miembros registrados.</p>
                    <p className="text-sm">Usa el botón "Administrar Equipo" para empezar a agregar personas.</p>
                </div>
            )}
        </main>
    );
};

export default MainBoard;
