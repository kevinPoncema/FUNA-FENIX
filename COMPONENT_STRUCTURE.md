# Estructura de Componentes Refactorizada

## Estructura del Proyecto

```
src/
├── api/                    # Lógica de backend/Firebase
│   ├── constants.js        # Constantes de la aplicación
│   ├── firebase.js         # Configuración y utilidades de Firebase
│   ├── feedbackService.js  # Servicio para operaciones CRUD de feedback
│   ├── membersService.js   # Servicio para operaciones CRUD de miembros
│   ├── useFirestoreData.js # Hook personalizado para Firebase
│   └── index.js           # Exportaciones de la API
├── components/             # Componentes de React
│   ├── ErrorDisplay.jsx       # Componente para mostrar errores
│   ├── FeedbackFormModal.jsx  # Modal para crear feedback
│   ├── FloatingButtons.jsx    # Botones flotantes
│   ├── Header.jsx             # Cabecera de la aplicación
│   ├── Loading.jsx            # Componente de carga
│   ├── MainBoard.jsx          # Tablero principal
│   ├── MemberManagementModal.jsx # Modal de gestión de miembros
│   ├── MemberRow.jsx          # Fila de miembro individual
│   ├── PostItDetailModal.jsx  # Modal de detalle de post-it
│   ├── PostItNote.jsx         # Nota post-it individual
│   ├── UserInfo.jsx           # Información del usuario
│   └── index.js              # Exportaciones de componentes
├── App.jsx                 # Componente principal refactorizado
└── main.jsx               # Punto de entrada
```

## Descripción de Módulos

### API (/api)

- **constants.js**: Contiene todas las constantes de la aplicación (límites de caracteres, miembros por defecto)
- **firebase.js**: Funciones de inicialización, autenticación y configuración de listeners de Firebase
- **feedbackService.js**: Clase de servicio para operaciones CRUD de feedback
- **membersService.js**: Clase de servicio para operaciones CRUD de miembros del equipo
- **useFirestoreData.js**: Hook personalizado que encapsula toda la lógica de Firebase

### Componentes (/components)

- **App.jsx**: Componente principal refactorizado y simplificado
- **ErrorDisplay.jsx**: Manejo de errores de la aplicación
- **Loading.jsx**: Pantalla de carga
- **Header.jsx**: Cabecera con título y categorías
- **UserInfo.jsx**: Información del usuario actual
- **FloatingButtons.jsx**: Botones de acción flotantes
- **MainBoard.jsx**: Tablero principal que contiene las filas de miembros
- **MemberRow.jsx**: Fila individual de cada miembro con sus post-its
- **PostItNote.jsx**: Componente individual de cada post-it
- **PostItDetailModal.jsx**: Modal para ver el detalle completo de un post-it
- **FeedbackFormModal.jsx**: Modal para crear nuevo feedback
- **MemberManagementModal.jsx**: Modal para administrar miembros del equipo

## Ventajas de la Nueva Estructura

1. **Separación de responsabilidades**: La lógica de backend está separada de los componentes UI
2. **Reutilización**: Cada componente es independiente y reutilizable
3. **Mantenibilidad**: Más fácil de mantener y debuggear
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades
5. **Testing**: Cada componente se puede testear de forma independiente
6. **Legibilidad**: El código es más limpio y fácil de entender

## Importaciones

Todos los módulos pueden importarse desde sus archivos de índice:

```javascript
// Importar componentes
import { Loading, ErrorDisplay, Header } from './components';

// Importar API
import { useFirestoreData, FeedbackService } from './api';
```
