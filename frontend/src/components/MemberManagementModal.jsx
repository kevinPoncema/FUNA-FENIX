import React, { useState, useEffect, useRef } from 'react';
import { Users, X, Plus, Trash2, Edit, Save, XCircle } from 'lucide-react';

/**
 * Componente Modal para administrar los miembros del equipo
 */
const MemberManagementModal = ({ members, isVisible, onClose, onAdd, onDelete, onUpdate }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: '', role: '' });
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [newMemberIds, setNewMemberIds] = useState(new Set());
    const previousMembersRef = useRef([]);

    // Detectar miembros nuevos
    useEffect(() => {
        const previousIds = new Set(previousMembersRef.current.map(m => m.id));
        const currentIds = new Set(members.map(m => m.id));
        
        // Encontrar IDs nuevos
        const newIds = members
            .filter(m => !previousIds.has(m.id))
            .map(m => m.id);

        if (newIds.length > 0) {
            setNewMemberIds(prev => {
                const updated = new Set([...prev, ...newIds]);
                // Quitar la animación después de 800ms
                setTimeout(() => {
                    setNewMemberIds(current => {
                        const next = new Set(current);
                        newIds.forEach(id => next.delete(id));
                        return next;
                    });
                }, 800);
                return updated;
            });
        }

        previousMembersRef.current = [...members];
    }, [members]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        await onAdd(name, role);
        setIsSaving(false);
        setName('');
        setRole('');
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setEditData({ name: member.name, role: member.role });
    };

    const handleSaveEdit = async (memberId) => {
        if (!editData.name.trim()) return;

        setIsSaving(true);
        await onUpdate(memberId, editData);
        setIsSaving(false);
        setEditingId(null);
        setEditData({ name: '', role: '' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ name: '', role: '' });
    };

    const handleDelete = async (memberId) => {
        setDeletingIds(prev => new Set([...prev, memberId]));
        
        // Esperar la animación antes de llamar onDelete
        setTimeout(() => {
            onDelete(memberId);
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(memberId);
                return next;
            });
        }, 400);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-100 text-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-purple-500/50">
                <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
                    <h3 className="text-2xl font-extrabold text-purple-600 flex items-center gap-2">
                        <Users size={24} className="text-purple-600" /> Administrar Equipo
                    </h3>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700 transition p-1">
                        <X size={20} className="text-red-500" />
                    </button>
                </div>

                {/* Formulario para Agregar Miembro */}
                <form onSubmit={handleAdd} className="flex gap-4 p-4 mb-6 bg-purple-100 rounded-lg border border-purple-300">
                    <input
                        type="text"
                        placeholder="Nombre del Miembro (Ej: Juan Pérez)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2.5 rounded-lg border border-gray-300 w-full text-gray-900 bg-white"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Rol (Ej: Frontend Dev)"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="p-2.5 rounded-lg border border-gray-300 w-full md:w-1/2 text-gray-900 bg-white"
                    />
                    <button
                        type="submit"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold transition duration-150 ${
                            isSaving ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        disabled={isSaving}
                    >
                        <Plus size={18} className="text-white" /> {isSaving ? 'Guardando...' : 'Añadir'}
                    </button>
                </form>

                {/* Lista de Miembros Actuales */}
                <h4 className="text-xl font-bold mb-3 text-gray-700 border-b pb-2">
                    Miembros Actuales ({members.length})
                </h4>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {members.map((member) => {
                        const isDeleting = deletingIds.has(member.id);
                        const isNew = newMemberIds.has(member.id);
                        
                        const animationClasses = `
                            ${isNew ? 'animate-pulse bg-green-50 scale-105 border-green-300' : ''}
                            ${isDeleting ? 'animate-bounce scale-90 opacity-40 bg-red-50' : ''}
                            transition-all duration-400 ease-in-out
                        `;

                        return (
                            <li 
                                key={member.id} 
                                className={`flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200 ${animationClasses}`}
                            >
                                {editingId === member.id ? (
                                    /* Modo de edición */
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                                            {editData.name ? editData.name.charAt(0) : member.name.charAt(0)}
                                        </div>
                                        <div className="flex gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="p-1.5 border border-gray-300 rounded text-sm flex-1 text-gray-900 bg-white"
                                                placeholder="Nombre"
                                            />
                                            <input
                                                type="text"
                                                value={editData.role}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="p-1.5 border border-gray-300 rounded text-sm flex-1 text-gray-900 bg-white"
                                                placeholder="Rol"
                                            />
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleSaveEdit(member.id)}
                                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition"
                                                title="Guardar cambios"
                                                disabled={isSaving}
                                            >
                                                <Save size={16} className="text-green-600" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition"
                                                title="Cancelar edición"
                                            >
                                                <XCircle size={16} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Modo de visualización */
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.role || 'Sin rol'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                                                title="Editar miembro"
                                                disabled={isDeleting}
                                            >
                                                <Edit size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className={`p-2 rounded-full transition ${
                                                    isDeleting 
                                                        ? 'text-red-400 cursor-not-allowed' 
                                                        : 'text-red-600 hover:bg-red-100'
                                                }`}
                                                title="Eliminar miembro y todo su feedback asociado"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <button 
                    onClick={onClose} 
                    className="w-full mt-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default MemberManagementModal;
