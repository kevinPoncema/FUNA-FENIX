import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Sistema híbrido: simula eventos cuando no hay servidor de broadcasting real
class HybridEcho {
    constructor() {
        this.channels = new Map();
        this.isConnected = false;
        console.log('HybridEcho initialized - usando eventos simulados para desarrollo');
    }

    channel(name) {
        if (!this.channels.has(name)) {
            this.channels.set(name, new HybridChannel(name));
        }
        return this.channels.get(name);
    }

    // Método interno para simular eventos desde API calls
    _simulateEventFromAPI(channelName, eventName, data) {
        const channel = this.channels.get(channelName);
        if (channel) {
            // Simular un pequeño delay para que sea más realista
            setTimeout(() => {
                channel.triggerEvent(eventName, data);
            }, 100);
        }
    }
}

class HybridChannel {
    constructor(name) {
        this.name = name;
        this.eventListeners = new Map();
        console.log(`Canal ${name} creado`);
    }

    listen(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
        console.log(`Listener agregado para ${this.name}:${eventName}`);
        return this;
    }

    triggerEvent(eventName, data) {
        const listeners = this.eventListeners.get(eventName) || [];
        console.log(`Disparando evento ${this.name}:${eventName}`, data);
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }
}

// Configuración de Echo real (ahora conecta al servidor Soketi)
const createRealEcho = () => {
    window.Pusher = Pusher;
    
    const config = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'local-key',
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
        wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        disableStats: true,
    };
    
    console.log('Echo configuration:', config);
    
    const echo = new Echo(config);
    
    // Log connection events
    echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Connected to WebSocket server');
    });
    
    echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ Disconnected from WebSocket server');
    });
    
    echo.connector.pusher.connection.bind('error', (error) => {
        console.error('❌ WebSocket connection error:', error);
    });
    
    return echo;
};

// Por ahora usamos HybridEcho - cambiar a createRealEcho() para usar servidor real
const USE_REAL_ECHO = true; // Cambiar a true para usar Soketi
export const echo = USE_REAL_ECHO ? createRealEcho() : new HybridEcho();

// Función para cambiar a Echo real cuando esté listo
export const initializeRealEcho = () => {
    return createRealEcho();
};

export default echo;