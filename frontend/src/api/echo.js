import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher globalmente
window.Pusher = Pusher;

// Configuración de Echo usando variables de entorno
const echoConfig = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    disableStats: true,
    encrypted: false,
};

let echoInstance;

try {
    echoInstance = new Echo(echoConfig);
    console.log('Echo configurado exitosamente con Soketi');
} catch (error) {
    console.warn('Error configurando Echo real, usando sistema híbrido:', error);
    
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
    
    echoInstance = new HybridEcho();
}

// Función para cambiar a Echo real cuando esté listo
export const initializeRealEcho = () => {
    try {
        const realEcho = new Echo(echoConfig);
        console.log('✅ Echo real inicializado correctamente');
        return realEcho;
    } catch (error) {
        console.error('❌ Error inicializando Echo real:', error);
        return echoInstance;
    }
};

export const echo = echoInstance;
export default echo;