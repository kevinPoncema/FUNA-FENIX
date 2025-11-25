import { delay, handleError } from '../utils/helpers.js';

/**
 * Servicio genérico para manejar operaciones de feedback
 * Funciona con cualquier proveedor que implemente IDataProvider
 */
export class FeedbackService {
    constructor(dataProvider, userId) {
        this.provider = dataProvider;
        this.userId = userId;
    }

    /**
     * Actualiza el ID del usuario actual
     * @param {string} userId - Nuevo ID de usuario
     */
    setUserId(userId) {
        this.userId = userId;
    }

    /**
     * Obtiene todo el feedback
     * @returns {Promise<Array>} Lista de feedback
     */
    async getFeedback() {
        try {
            return await this.provider.getFeedback();
        } catch (error) {
            throw handleError(error, 'Error al obtener feedback');
        }
    }

    /**
     * Obtiene feedback para un miembro específico
     * @param {string} memberId - ID del miembro
     * @returns {Promise<Array>} Lista de feedback del miembro
     */
    async getFeedbackForMember(memberId) {
        try {
            const allFeedback = await this.getFeedback();
            return allFeedback.filter(feedback => feedback.targetId === memberId);
        } catch (error) {
            throw handleError(error, 'Error al obtener feedback del miembro');
        }
    }

    /**
     * Obtiene feedback por categoría para un miembro
     * @param {string} memberId - ID del miembro
     * @param {string} category - Categoría del feedback
     * @returns {Promise<Array>} Lista de feedback filtrado
     */
    async getFeedbackByCategory(memberId, category) {
        try {
            const memberFeedback = await this.getFeedbackForMember(memberId);
            return memberFeedback.filter(feedback => feedback.category === category);
        } catch (error) {
            throw handleError(error, 'Error al obtener feedback por categoría');
        }
    }

    /**
     * Añade nuevo feedback
     * @param {Object} feedbackData - Datos del feedback
     * @returns {Promise<Object>} Feedback creado
     */
    async addFeedback(feedbackData) {
        if (!this.userId) {
            throw new Error('Usuario no autenticado');
        }

        if (!feedbackData || typeof feedbackData !== 'object') {
            throw new Error('Datos de feedback inválidos');
        }

        try {
            await delay(50);
            return await this.provider.addFeedback(feedbackData);
        } catch (error) {
            throw handleError(error, 'Error al añadir feedback');
        }
    }

    /**
     * Elimina feedback
     * @param {string} feedbackId - ID del feedback a eliminar
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteFeedback(feedbackId) {
        if (!feedbackId) {
            throw new Error('ID de feedback requerido');
        }

        try {
            await delay(50);
            return await this.provider.deleteFeedback(feedbackId);
        } catch (error) {
            throw handleError(error, 'Error al eliminar feedback');
        }
    }

    /**
     * Verifica si el usuario actual puede eliminar un feedback
     * @param {Object} feedback - Objeto de feedback
     * @returns {boolean} Si puede eliminar
     */
    canDeleteFeedback(feedback) {
        return feedback && feedback.authorId === this.userId;
    }

    /**
     * Obtiene feedback creado por el usuario actual
     * @returns {Promise<Array>} Lista de feedback del usuario
     */
    async getMyFeedback() {
        try {
            const allFeedback = await this.getFeedback();
            return allFeedback.filter(feedback => feedback.authorId === this.userId);
        } catch (error) {
            throw handleError(error, 'Error al obtener mi feedback');
        }
    }

    /**
     * Obtiene estadísticas de feedback
     * @returns {Promise<Object>} Estadísticas de feedback
     */
    async getFeedbackStats() {
        try {
            const allFeedback = await this.getFeedback();
            
            const stats = {
                total: allFeedback.length,
                byCategory: {
                    achievements: 0,
                    qualities: 0,
                    potential: 0
                },
                byUser: {},
                myContributions: 0
            };

            allFeedback.forEach(feedback => {
                // Por categoría
                if (stats.byCategory[feedback.category] !== undefined) {
                    stats.byCategory[feedback.category]++;
                }

                // Por usuario
                if (!stats.byUser[feedback.authorId]) {
                    stats.byUser[feedback.authorId] = 0;
                }
                stats.byUser[feedback.authorId]++;

                // Mis contribuciones
                if (feedback.authorId === this.userId) {
                    stats.myContributions++;
                }
            });

            return stats;
        } catch (error) {
            throw handleError(error, 'Error al obtener estadísticas');
        }
    }

    /**
     * Actualiza un feedback (si el proveedor lo soporta)
     * @param {string} feedbackId - ID del feedback
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Feedback actualizado
     */
    async updateFeedback(feedbackId, updateData) {
        if (typeof this.provider.updateFeedback === 'function') {
            try {
                await delay(50);
                return await this.provider.updateFeedback(feedbackId, updateData);
            } catch (error) {
                throw handleError(error, 'Error al actualizar feedback');
            }
        } else {
            throw new Error('Operación de actualización no soportada por el proveedor actual');
        }
    }

    /**
     * Suscribe a cambios de feedback
     * @param {Function} callback - Función callback para cambios
     * @returns {Function} Función de desuscripción
     */
    onFeedbackChange(callback) {
        return this.provider.onFeedbackChange(callback);
    }
}
