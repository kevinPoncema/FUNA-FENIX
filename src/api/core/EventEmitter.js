/**
 * Sistema de eventos genérico para cualquier tipo de proveedor de datos
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Suscribe a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función callback
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Desuscribe de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función callback a remover
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emite un evento
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a enviar
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en callback del evento ${event}:`, error);
                }
            });
        }
    }

    /**
     * Limpia todos los listeners
     */
    removeAllListeners() {
        this.events = {};
    }

    /**
     * Obtiene el número de listeners para un evento
     * @param {string} event - Nombre del evento
     * @returns {number} - Número de listeners
     */
    listenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }
}
