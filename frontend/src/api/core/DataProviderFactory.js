import { LocalStorageProvider } from '../providers/LocalStorageProvider.js';
// import { ApiRestProvider } from '../providers/ApiRestProvider.js';
// import { WebSocketProvider } from '../providers/WebSocketProvider.js';

/**
 * Factory para crear proveedores de datos
 * Permite intercambiar fácilmente entre diferentes implementaciones
 */
export class DataProviderFactory {
    
    /**
     * Tipos de proveedores disponibles
     */
    static PROVIDER_TYPES = {
        LOCAL_STORAGE: 'localStorage',
        API_REST: 'apiRest',
        WEBSOCKET: 'websocket'
    };

    /**
     * Crea una instancia del proveedor especificado
     * @param {string} type - Tipo de proveedor (usa PROVIDER_TYPES)
     * @param {Object} config - Configuración específica del proveedor
     * @returns {IDataProvider} Instancia del proveedor
     */
    static createProvider(type, config = {}) {
        switch (type) {
            case this.PROVIDER_TYPES.LOCAL_STORAGE:
                return new LocalStorageProvider();

            // case this.PROVIDER_TYPES.API_REST:
            //     return new ApiRestProvider();

            // case this.PROVIDER_TYPES.WEBSOCKET:
            //     return new WebSocketProvider();

            default:
                throw new Error(`Tipo de proveedor no soportado: ${type}`);
        }
    }

    /**
     * Obtiene el proveedor por defecto
     * @param {Object} config - Configuración
     * @returns {IDataProvider} Instancia del proveedor por defecto
     */
    static createDefaultProvider(config = {}) {
        return this.createProvider(this.PROVIDER_TYPES.LOCAL_STORAGE, config);
    }

    /**
     * Verifica si un tipo de proveedor está disponible
     * @param {string} type - Tipo de proveedor
     * @returns {boolean} Si el proveedor está disponible
     */
    static isProviderAvailable(type) {
        return Object.values(this.PROVIDER_TYPES).includes(type);
    }

    /**
     * Obtiene todos los tipos de proveedores disponibles
     * @returns {string[]} Lista de tipos disponibles
     */
    static getAvailableProviders() {
        return Object.values(this.PROVIDER_TYPES);
    }
}
