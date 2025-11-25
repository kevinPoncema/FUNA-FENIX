/**
 * Utilidades generales para la API
 */

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Genera un timestamp ISO
 * @returns {string} Timestamp en formato ISO
 */
export const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Valida los datos de un miembro
 * @param {Object} memberData - Datos del miembro
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateMemberData = (memberData) => {
    const errors = [];
    
    if (!memberData.name || typeof memberData.name !== 'string' || !memberData.name.trim()) {
        errors.push('El nombre del miembro es requerido');
    }
    
    if (memberData.name && memberData.name.trim().length > 100) {
        errors.push('El nombre del miembro no puede exceder 100 caracteres');
    }
    
    if (memberData.role && typeof memberData.role !== 'string') {
        errors.push('El rol debe ser una cadena de texto');
    }
    
    if (memberData.role && memberData.role.length > 100) {
        errors.push('El rol no puede exceder 100 caracteres');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Valida los datos de feedback
 * @param {Object} feedbackData - Datos del feedback
 * @param {number} maxTitleChars - Máximo de caracteres para título
 * @param {number} maxTextChars - Máximo de caracteres para texto
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateFeedbackData = (feedbackData, maxTitleChars = 50, maxTextChars = 300) => {
    const errors = [];
    const validCategories = ['achievements', 'qualities', 'potential'];
    
    if (!feedbackData.title || typeof feedbackData.title !== 'string' || !feedbackData.title.trim()) {
        errors.push('El título es requerido');
    }
    
    if (feedbackData.title && feedbackData.title.trim().length > maxTitleChars) {
        errors.push(`El título no puede exceder ${maxTitleChars} caracteres`);
    }
    
    if (!feedbackData.text || typeof feedbackData.text !== 'string' || !feedbackData.text.trim()) {
        errors.push('El contenido es requerido');
    }
    
    if (feedbackData.text && feedbackData.text.trim().length > maxTextChars) {
        errors.push(`El contenido no puede exceder ${maxTextChars} caracteres`);
    }
    
    if (!feedbackData.targetId || typeof feedbackData.targetId !== 'string') {
        errors.push('El ID del destinatario es requerido');
    }
    
    if (!feedbackData.category || !validCategories.includes(feedbackData.category)) {
        errors.push('La categoría debe ser una de: ' + validCategories.join(', '));
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Crea un delay asíncrono
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que se resuelve después del delay
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Maneja errores de manera consistente
 * @param {Error|string} error - Error a manejar
 * @param {string} context - Contexto donde ocurrió el error
 * @returns {Error} Error formateado
 */
export const handleError = (error, context = '') => {
    const message = typeof error === 'string' ? error : error.message;
    const fullMessage = context ? `${context}: ${message}` : message;
    
    console.error(fullMessage, error instanceof Error ? error.stack : '');
    
    return new Error(fullMessage);
};

/**
 * Sanitiza una cadena de texto
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena sanitizada
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
};
