import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { MAX_POSTIT_CHARS, MAX_TITLE_CHARS } from '../api/constants.js';

/**
 * Componente Modal para crear un nuevo Post-it
 */
const FeedbackFormModal = ({ members, isVisible, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        targetId: '',
        category: 'achievements',
        title: '',
        text: '',
    });

    const [error, setError] = useState('');

    // Configuración inicial de miembros
    useEffect(() => {
        if (isVisible && members.length > 0 && !formData.targetId) {
            setFormData(prev => ({ ...prev, targetId: members[0].id }));
        }
        if (!isVisible) {
            // Resetear al cerrar
            setFormData({
                targetId: members.length > 0 ? members[0].id : '',
                category: 'achievements',
                title: '',
                text: '',
            });
            setError('');
        }
    }, [isVisible, members]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.targetId || !formData.text.trim() || !formData.title.trim()) {
            setError('Por favor, selecciona un miembro, escribe el título y el contenido del feedback.');
            return;
        }

        onSave(formData);
        onClose();
    };

    if (!isVisible) return null;

    if (members.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                <div className="bg-yellow-100 text-yellow-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-yellow-500/50">
                    <p className="font-bold">No hay miembros en el equipo.</p>
                    <p className="text-sm mt-2">Por favor, usa el botón de "Administrar Equipo" para agregar al menos una persona antes de añadir feedback.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    // Definiciones de categorías para el formulario
    const categories = [
        { 
            id: 'achievements', 
            title: 'Logros 🟢', 
            description: 'Reconocimiento de logros y fortalezas.' 
        },
        { 
            id: 'qualities', 
            title: 'Cualidades 🔴', 
            description: 'Aspectos positivos y habilidades destacadas.' 
        },
        { 
            id: 'potential', 
            title: 'Potencial �', 
            description: 'Áreas de crecimiento y desarrollo futuro.' 
        },
    ];

    const currentCategory = categories.find(c => c.id === formData.category);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-100 text-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-indigo-500/50 transform scale-100 transition-transform duration-300">
                <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
                    <h3 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
                        <Send size={24} /> Nuevo Post-it
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Campo Miembro Objetivo */}
                    <div>
                        <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 mb-1">
                            Dirigido a:
                        </label>
                        <select
                            id="targetId"
                            name="targetId"
                            value={formData.targetId}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            required
                        >
                            <option value="" disabled>Selecciona un miembro</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.role})
                                </option>
                            ))}
                        </select>
                    </div>elimina lo que hictes de la migracion y modfica el test el request y el controller y todo loq ue s

                    {/* Campo Categoría */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría:
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">{currentCategory?.description}</p>
                    </div>

                    {/* Campo de Título */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Título del Post-it (Máx. {MAX_TITLE_CHARS} caracteres):
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={MAX_TITLE_CHARS}
                            className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            placeholder="Ej: Gran manejo de la crisis"
                            required
                        />
                    </div>

                    {/* Campo Contenido del Post-it */}
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje (Máx. {MAX_POSTIT_CHARS} caracteres):
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            rows="4"
                            maxLength={MAX_POSTIT_CHARS}
                            className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner"
                            placeholder="Ej: Reconozco tu iniciativa para refactorizar el módulo de pagos, fue crucial para reducir la deuda técnica en un 20%."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {formData.text.length} / {MAX_POSTIT_CHARS}
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    {/* Botón de Envío */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition duration-150 shadow-lg"
                    >
                        <Send size={18} /> Publicar Post-it
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackFormModal;
