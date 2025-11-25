/**
 * Interfaz base para proveedores de datos
 * Permite intercambiar entre localStorage, API REST, WebSockets, etc.
 */
export class IDataProvider {
    /**
     * Inicializa el proveedor de datos
     * @param {Object} config - Configuración específica del proveedor
     */
    async initialize(config = {}) {
        throw new Error('initialize() debe ser implementado por la subclase');
    }

    /**
     * Autentica al usuario
     * @returns {Promise<Object>} - Datos del usuario autenticado
     */
    async authenticate() {
        throw new Error('authenticate() debe ser implementado por la subclase');
    }

    /**
     * Obtiene todos los miembros del equipo
     * @returns {Promise<Array>} - Lista de miembros
     */
    async getMembers() {
        throw new Error('getMembers() debe ser implementado por la subclase');
    }

    /**
     * Añade un nuevo miembro
     * @param {Object} memberData - Datos del miembro
     * @returns {Promise<Object>} - Miembro creado
     */
    async addMember(memberData) {
        throw new Error('addMember() debe ser implementado por la subclase');
    }

    /**
     * Elimina un miembro
     * @param {string} memberId - ID del miembro a eliminar
     * @returns {Promise<boolean>} - Éxito de la operación
     */
    async deleteMember(memberId) {
        throw new Error('deleteMember() debe ser implementado por la subclase');
    }

    /**
     * Obtiene todo el feedback
     * @returns {Promise<Array>} - Lista de feedback
     */
    async getFeedback() {
        throw new Error('getFeedback() debe ser implementado por la subclase');
    }

    /**
     * Añade nuevo feedback
     * @param {Object} feedbackData - Datos del feedback
     * @returns {Promise<Object>} - Feedback creado
     */
    async addFeedback(feedbackData) {
        throw new Error('addFeedback() debe ser implementado por la subclase');
    }

    /**
     * Elimina feedback
     * @param {string} feedbackId - ID del feedback a eliminar
     * @returns {Promise<boolean>} - Éxito de la operación
     */
    async deleteFeedback(feedbackId) {
        throw new Error('deleteFeedback() debe ser implementado por la subclase');
    }

    /**
     * Suscribe a cambios de miembros
     * @param {Function} callback - Función callback para cambios
     * @returns {Function} - Función de desuscripción
     */
    onMembersChange(callback) {
        throw new Error('onMembersChange() debe ser implementado por la subclase');
    }

    /**
     * Suscribe a cambios de feedback
     * @param {Function} callback - Función callback para cambios
     * @returns {Function} - Función de desuscripción
     */
    onFeedbackChange(callback) {
        throw new Error('onFeedbackChange() debe ser implementado por la subclase');
    }

    /**
     * Limpia todos los datos (útil para testing)
     */
    async clearAll() {
        throw new Error('clearAll() debe ser implementado por la subclase');
    }

    /**
     * Cierra la conexión/limpia recursos
     */
    async disconnect() {
        // Implementación opcional
    }
}
