# API Genérica - Documentación

## Visión General

El nuevo sistema de API es completamente genérico e independiente de cualquier tecnología específica. Ha sido diseñado con los siguientes principios:

### 🎯 **Principios de Diseño**
- **Intercambiabilidad**: Cambiar entre localStorage, API REST o WebSockets sin modificar componentes
- **Extensibilidad**: Fácil agregar nuevos proveedores de datos
- **Consistencia**: Interfaz uniforme sin importar el proveedor
- **Preparado para el futuro**: Arquitectura lista para WebSockets y APIs reales

## 🏗️ **Arquitectura**

### **Capas de la Arquitectura**

```
┌─────────────────────────────────────┐
│           Componentes React         │ ← useDataProvider hook
├─────────────────────────────────────┤
│            Servicios                │ ← FeedbackService, TeamMembersService
├─────────────────────────────────────┤
│          DataManager                │ ← Coordinador principal
├─────────────────────────────────────┤
│      IDataProvider (Interface)      │ ← Contrato común
├─────────────────────────────────────┤
│         Proveedores Concretos       │ ← LocalStorage, API, WebSocket
└─────────────────────────────────────┘
```

### **Componentes Principales**

#### **IDataProvider** (Interfaz)
- Define el contrato que deben cumplir todos los proveedores
- Métodos estándar para CRUD de miembros y feedback
- Sistema de eventos para cambios en tiempo real

#### **Proveedores Implementados**
- **LocalStorageProvider**: Implementación completa usando localStorage
- **ApiRestProvider**: Plantilla lista para API REST (pendiente implementación)
- **WebSocketProvider**: Plantilla lista para WebSockets (pendiente implementación)

#### **DataManager**
- Coordinador central que maneja servicios y proveedores
- Facilita el cambio dinámico de proveedores
- Configura listeners de eventos

#### **Servicios**
- **TeamMembersService**: Lógica de negocio para miembros
- **FeedbackService**: Lógica de negocio para feedback
- Validaciones, transformaciones y operaciones avanzadas

## 📚 **Uso Básico**

### **Hook Simple (Recomendado)**
```javascript
import { useLocalStorageData } from './api/useDataProvider.js';

const MyComponent = () => {
    const {
        teamMembers,
        feedbackData,
        isLoading,
        error,
        addMember,
        addFeedback,
        deleteMember,
        deleteFeedback
    } = useLocalStorageData();

    // Tu componente funciona igual que antes
    return <div>...</div>;
};
```

### **Hook Avanzado con Configuración**
```javascript
import { useDataProvider, DataProviderFactory } from './api';

const MyComponent = () => {
    const {
        teamMembers,
        feedbackData,
        changeProvider,
        dataManager
    } = useDataProvider({
        providerType: DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE,
        useDefaultMembers: true,
        autoInitialize: true
    });

    // Cambiar a API REST dinámicamente
    const switchToAPI = () => {
        changeProvider(DataProviderFactory.PROVIDER_TYPES.API_REST, {
            baseUrl: 'https://api.example.com',
            authToken: 'your-token'
        });
    };

    return <div>...</div>;
};
```

## 🔧 **Configuración de Proveedores**

### **LocalStorage (Por Defecto)**
```javascript
const config = {
    providerType: 'localStorage',
    useDefaultMembers: true,
    autoInitialize: true
};
```

### **API REST (Cuando esté implementado)**
```javascript
const config = {
    providerType: 'apiRest',
    providerConfig: {
        baseUrl: 'https://your-api.com',
        authToken: 'bearer-token',
        timeout: 5000
    }
};
```

### **WebSocket (Cuando esté implementado)**
```javascript
const config = {
    providerType: 'websocket',
    providerConfig: {
        serverUrl: 'ws://your-server.com/socket',
        autoReconnect: true,
        protocols: ['feedback-protocol']
    }
};
```

## 🚀 **Uso Avanzado**

### **DataManager Directo**
```javascript
import { DataManager, DataProviderFactory } from './api';

const setupAdvancedAPI = async () => {
    const manager = new DataManager();
    
    await manager.initialize({
        providerType: DataProviderFactory.PROVIDER_TYPES.LOCAL_STORAGE,
        useDefaultMembers: true
    });

    const membersService = manager.getTeamMembersService();
    const feedbackService = manager.getFeedbackService();

    // Configurar listeners personalizados
    const cleanup = manager.setupListeners({
        onMembersChange: (members) => console.log('Miembros:', members),
        onFeedbackChange: (feedback) => console.log('Feedback:', feedback),
        onError: (error) => console.error('Error:', error)
    });

    return { manager, membersService, feedbackService, cleanup };
};
```

### **Servicios Independientes**
```javascript
import { LocalStorageProvider, TeamMembersService, FeedbackService } from './api';

const setupCustomServices = async () => {
    const provider = new LocalStorageProvider();
    await provider.initialize({ defaultMembers: [] });
    
    const authResult = await provider.authenticate();
    
    const membersService = new TeamMembersService(provider);
    const feedbackService = new FeedbackService(provider, authResult.uid);

    return { membersService, feedbackService };
};
```

## 🛠️ **Creando Nuevos Proveedores**

### **Pasos para Implementar un Proveedor**

1. **Crear clase que extienda IDataProvider**
```javascript
import { IDataProvider } from '../interfaces/IDataProvider.js';

export class MyCustomProvider extends IDataProvider {
    async initialize(config) {
        // Tu implementación
    }
    
    async getMembers() {
        // Tu implementación
    }
    
    // ... implementar todos los métodos de IDataProvider
}
```

2. **Registrar en DataProviderFactory**
```javascript
// En DataProviderFactory.js
static PROVIDER_TYPES = {
    LOCAL_STORAGE: 'localStorage',
    API_REST: 'apiRest',
    WEBSOCKET: 'websocket',
    MY_CUSTOM: 'myCustom'  // ← Agregar aquí
};

static createProvider(type, config = {}) {
    switch (type) {
        // ... otros casos
        case this.PROVIDER_TYPES.MY_CUSTOM:
            return new MyCustomProvider();
        // ...
    }
}
```

3. **Usar el nuevo proveedor**
```javascript
const { data } = useDataProvider({
    providerType: 'myCustom',
    providerConfig: { /* configuración específica */ }
});
```

## 📋 **Migración desde Sistema Anterior**

### **Cambios Necesarios**

1. **Importaciones** (Ya aplicado)
```javascript
// Antes
import { useLocalStorageData } from './api/useFirestoreData.js';

// Ahora  
import { useLocalStorageData } from './api/useDataProvider.js';
```

2. **Hook funciona igual**
```javascript
// El hook expone la misma interfaz, no hay cambios en componentes
const {
    teamMembers,
    feedbackData,
    addMember,
    addFeedback,
    // ... etc
} = useLocalStorageData();
```

3. **Funcionalidades nuevas disponibles**
```javascript
const {
    // ... datos anteriores
    changeProvider,        // ← NUEVO: cambiar proveedor dinámicamente
    getFeedbackStats,      // ← NUEVO: estadísticas de feedback
    clearAllData,          // ← NUEVO: limpiar todos los datos
    dataManager,           // ← NUEVO: acceso al manager
    isInitialized,         // ← NUEVO: estado de inicialización
    status                 // ← NUEVO: información del sistema
} = useLocalStorageData();
```

## 🔄 **Preparación para WebSockets**

El sistema está completamente preparado para WebSockets:

### **Características Listas**
- ✅ Sistema de eventos en tiempo real
- ✅ Interfaz uniforme para conexiones persistentes  
- ✅ Manejo de reconexión automática
- ✅ Gestión de estado de conexión

### **Para Activar WebSockets (cuando esté listo)**
```javascript
// Solo cambiar esta línea:
const data = useDataProvider({
    providerType: 'websocket',
    providerConfig: {
        serverUrl: 'ws://localhost:3001',
        autoReconnect: true
    }
});

// Todo lo demás funciona igual automáticamente
```

## ⚡ **Beneficios del Nuevo Sistema**

### **Para Desarrolladores**
- **Código más limpio**: Separación clara de responsabilidades
- **Fácil testing**: Servicios y proveedores pueden probarse independientemente
- **Extensible**: Agregar nuevas funcionalidades sin romper existentes
- **Type-safe**: Interfaces claras y consistentes

### **Para el Producto**
- **Performance**: Optimizaciones específicas por proveedor
- **Escalabilidad**: Fácil migrar a soluciones backend reales
- **Flexibilidad**: Cambiar tecnología sin reescribir la app
- **Futuro**: Preparado para cualquier tecnología nueva

## 🏁 **Próximos Pasos**

1. **Completar ApiRestProvider** cuando tengas backend
2. **Completar WebSocketProvider** para tiempo real
3. **Agregar IndexedDB provider** para más almacenamiento local
4. **Implementar caching inteligente** entre proveedores
5. **Agregar offline-first capabilities**
