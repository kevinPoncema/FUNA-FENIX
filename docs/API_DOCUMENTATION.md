# API Documentation - FUNA FENIX

## 📚 Documentación de API REST

Esta documentación describe todos los endpoints disponibles en la API de FUNA FENIX, incluyendo autenticación, gestión de feedbacks y usuarios.

**Base URL:** `http://localhost:8000/api`

---

## 🔐 Autenticación

### Sistema de Autenticación
La API utiliza **Laravel Sanctum** para autenticación basada en tokens. Todos los endpoints (excepto login) requieren un token válido en el header `Authorization`.

**Header requerido:**
```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 🔑 Endpoints de Autenticación

### Login
Autentica un usuario y devuelve un token de acceso.

**POST** `/api/login`

**Request Body:**
```json
{
    "email": "admin@admin.com",
    "password": "admin"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 11,
        "name": "Admin",
        "email": "admin@admin.com",
        "email_verified_at": null,
        "role": "admin",
        "created_at": "2025-11-26T21:24:34.000000Z",
        "updated_at": "2025-11-26T21:24:34.000000Z"
    },
    "token": "10|9FUi8piFwraAsX2RWxUVz1q8RatP4OeqVR5A1XLx06bfd182"
}
```

**Response (401):**
```json
{
    "message": "Invalid credentials"
}
```

### Logout
Revoca el token actual del usuario.

**POST** `/api/logout`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Successfully logged out"
}
```

### Usuario Actual
Obtiene información del usuario autenticado.

**GET** `/api/user`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "id": 11,
    "name": "Admin",
    "email": "admin@admin.com",
    "email_verified_at": null,
    "role": "admin",
    "created_at": "2025-11-26T21:24:34.000000Z",
    "updated_at": "2025-11-26T21:24:34.000000Z"
}
```

---

## 📝 Endpoints de Feedbacks

### Listar Feedbacks
Obtiene todos los feedbacks disponibles.

**GET** `/api/feedbacks`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "id": 1,
        "target_id": 2,
        "category": "achievements",
        "title": "Excelente trabajo",
        "text": "Carlos ha demostrado una gran capacidad de resolución de problemas.",
        "created_at": "2025-11-26T19:51:12.000000Z",
        "updated_at": "2025-11-26T19:51:12.000000Z",
        "owner_id": 6
    },
    {
        "id": 2,
        "target_id": 3,
        "category": "qualities",
        "title": "Gran liderazgo",
        "text": "Moys demuestra excelentes habilidades de comunicación y liderazgo.",
        "created_at": "2025-11-26T19:51:23.000000Z",
        "updated_at": "2025-11-26T19:51:23.000000Z",
        "owner_id": 6
    }
]
```

### Crear Feedback
Crea un nuevo feedback.

**POST** `/api/feedbacks`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "target_id": 2,
    "category": "achievements",
    "title": "Feedback de prueba",
    "text": "Este es un feedback de ejemplo creado desde la API"
}
```

**Validaciones:**
- `target_id`: Requerido, debe existir en tabla users
- `category`: Requerido, debe ser uno de: achievements, qualities, potential
- `title`: Requerido, máximo 255 caracteres
- `text`: Requerido, máximo 1000 caracteres

**Response (201):**
```json
{
    "id": 17,
    "target_id": 2,
    "category": "achievements",
    "title": "Feedback de prueba",
    "text": "Este es un feedback de ejemplo creado desde la API",
    "owner_id": 11,
    "created_at": "2025-11-26T21:27:30.000000Z",
    "updated_at": "2025-11-26T21:27:30.000000Z"
}
```

**Response (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "category": ["The selected category is invalid."],
        "title": ["The title field is required."]
    }
}
```

### Obtener Feedback
Obtiene un feedback específico por ID.

**GET** `/api/feedbacks/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "id": 1,
    "target_id": 2,
    "category": "achievements",
    "title": "Excelente trabajo",
    "text": "Carlos ha demostrado una gran capacidad de resolución de problemas.",
    "created_at": "2025-11-26T19:51:12.000000Z",
    "updated_at": "2025-11-26T19:51:12.000000Z",
    "owner_id": 6
}
```

**Response (404):**
```json
{
    "message": "Feedback not found"
}
```

### Actualizar Feedback
Actualiza un feedback existente.

**PUT** `/api/feedbacks/{id}`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "title": "Título actualizado",
    "text": "Texto actualizado del feedback",
    "category": "qualities"
}
```

**Response (200):**
```json
{
    "id": 1,
    "target_id": 2,
    "category": "qualities",
    "title": "Título actualizado",
    "text": "Texto actualizado del feedback",
    "created_at": "2025-11-26T19:51:12.000000Z",
    "updated_at": "2025-11-26T21:30:00.000000Z",
    "owner_id": 6
}
```

### Eliminar Feedback
Elimina un feedback específico.

**DELETE** `/api/feedbacks/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Feedback deleted successfully"
}
```

---

## 👥 Endpoints de Usuarios

### Listar Usuarios
Obtiene todos los usuarios del sistema.

**GET** `/api/users`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "id": 1,
        "name": "Carlos Mendoza",
        "email": "carlos@example.com",
        "role": "member",
        "created_at": "2025-11-26T19:50:45.000000Z",
        "updated_at": "2025-11-26T19:50:45.000000Z"
    },
    {
        "id": 2,
        "name": "Ana García",
        "email": "ana@example.com",
        "role": "member",
        "created_at": "2025-11-26T19:50:45.000000Z",
        "updated_at": "2025-11-26T19:50:45.000000Z"
    }
]
```

### Crear Usuario
Crea un nuevo usuario en el sistema.

**POST** `/api/users`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "password": "password123",
    "role": "member"
}
```

**Validaciones:**
- `name`: Requerido, máximo 255 caracteres
- `email`: Requerido, formato email válido, único en el sistema
- `password`: Requerido, mínimo 8 caracteres
- `role`: Requerido, debe ser uno de: admin, member

**Response (201):**
```json
{
    "id": 18,
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "role": "member",
    "created_at": "2025-11-26T21:35:00.000000Z",
    "updated_at": "2025-11-26T21:35:00.000000Z"
}
```

### Obtener Usuario
Obtiene un usuario específico por ID.

**GET** `/api/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "id": 1,
    "name": "Carlos Mendoza",
    "email": "carlos@example.com",
    "role": "member",
    "created_at": "2025-11-26T19:50:45.000000Z",
    "updated_at": "2025-11-26T19:50:45.000000Z"
}
```

### Actualizar Usuario
Actualiza un usuario existente.

**PUT** `/api/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Carlos Mendoza Actualizado",
    "email": "carlos.actualizado@example.com",
    "role": "admin"
}
```

**Response (200):**
```json
{
    "id": 1,
    "name": "Carlos Mendoza Actualizado",
    "email": "carlos.actualizado@example.com",
    "role": "admin",
    "created_at": "2025-11-26T19:50:45.000000Z",
    "updated_at": "2025-11-26T21:40:00.000000Z"
}
```

### Eliminar Usuario
Elimina un usuario del sistema.

**DELETE** `/api/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "User deleted successfully"
}
```

---

## 🔄 Eventos en Tiempo Real

### Canales de Broadcasting

#### Canal: `feedback-updates`
Eventos relacionados con cambios en feedbacks.

**Eventos disponibles:**
- `feedback.created`: Nuevo feedback creado
- `feedback.updated`: Feedback actualizado
- `feedback.deleted`: Feedback eliminado

**Estructura de evento:**
```javascript
// feedback.created
{
    feedback: {
        id: 17,
        target_id: 2,
        category: "achievements",
        title: "Nuevo feedback",
        text: "Texto del feedback",
        owner_id: 11,
        created_at: "2025-11-26T21:27:30.000000Z",
        updated_at: "2025-11-26T21:27:30.000000Z"
    }
}
```

#### Canal: `team-updates`
Eventos relacionados con cambios en miembros del equipo.

**Eventos disponibles:**
- `team-member.created`: Nuevo miembro añadido
- `team-member.updated`: Miembro actualizado
- `team-member.deleted`: Miembro eliminado

### Conexión WebSocket (Frontend)

```javascript
import echo from './echo.js';

// Escuchar eventos de feedback
echo.channel('feedback-updates')
    .listen('feedback.created', (e) => {
        console.log('Nuevo feedback:', e.feedback);
    })
    .listen('feedback.updated', (e) => {
        console.log('Feedback actualizado:', e.feedback);
    })
    .listen('feedback.deleted', (e) => {
        console.log('Feedback eliminado:', e.feedback);
    });

// Escuchar eventos de equipo
echo.channel('team-updates')
    .listen('team-member.created', (e) => {
        console.log('Nuevo miembro:', e.user);
    });
```

---

## ⚠️ Códigos de Error

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos para la acción |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

### Estructura de Errores

**Error de Validación (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

**Error de Autenticación (401):**
```json
{
    "message": "Unauthenticated."
}
```

**Error de Recurso No Encontrado (404):**
```json
{
    "message": "Resource not found"
}
```

---

## 🔧 Rate Limiting

### Límites de API

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/login` | 5 intentos | 1 minuto |
| `/api/*` | 60 requests | 1 minuto |

**Respuesta cuando se alcanza el límite (429):**
```json
{
    "message": "Too Many Attempts."
}
```

---

## 📊 Ejemplos de Uso

### Flujo Completo de Autenticación y Feedback

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'

# Respuesta con token
# {"message":"Login successful","user":{...},"token":"10|..."}

# 2. Crear feedback usando el token
curl -X POST http://localhost:8000/api/feedbacks \
  -H "Authorization: Bearer 10|9FUi8piFwraAsX2RWxUVz1q8RatP4OeqVR5A1XLx06bfd182" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 2,
    "category": "achievements",
    "title": "Excelente trabajo en equipo",
    "text": "Ha demostrado gran colaboración en el proyecto actual"
  }'

# 3. Obtener lista actualizada
curl -X GET http://localhost:8000/api/feedbacks \
  -H "Authorization: Bearer 10|9FUi8piFwraAsX2RWxUVz1q8RatP4OeqVR5A1XLx06bfd182"

# 4. Logout
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer 10|9FUi8piFwraAsX2RWxUVz1q8RatP4OeqVR5A1XLx06bfd182"
```

### Testing con JavaScript

```javascript
// Configuración base
const baseURL = 'http://localhost:8000/api';
let authToken = null;

// Función helper para requests
async function apiRequest(endpoint, options = {}) {
    const url = `${baseURL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
}

// Test de login
async function testLogin() {
    try {
        const result = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin'
            })
        });
        
        authToken = result.token;
        console.log('Login exitoso:', result.user);
        return result;
    } catch (error) {
        console.error('Error en login:', error);
    }
}

// Test de creación de feedback
async function testCreateFeedback() {
    try {
        const feedback = await apiRequest('/feedbacks', {
            method: 'POST',
            body: JSON.stringify({
                target_id: 2,
                category: 'achievements',
                title: 'Test desde JavaScript',
                text: 'Feedback creado desde test automatizado'
            })
        });
        
        console.log('Feedback creado:', feedback);
        return feedback;
    } catch (error) {
        console.error('Error creando feedback:', error);
    }
}

// Ejecutar tests
async function runTests() {
    console.log('Iniciando tests de API...');
    
    await testLogin();
    await testCreateFeedback();
    
    console.log('Tests completados');
}

runTests();
```

---

## 🛡️ Seguridad

### Medidas Implementadas

1. **Autenticación Laravel Sanctum**
   - Tokens seguros generados aleatoriamente
   - Expiración configurable
   - Revocación de tokens

2. **Validación de Datos**
   - Validación estricta en todos los endpoints
   - Sanitización de input
   - Prevención de SQL injection

3. **CORS Configurado**
   - Headers apropiados para frontend
   - Origen específico permitido

4. **Rate Limiting**
   - Protección contra ataques de fuerza bruta
   - Límites por IP y por usuario

### Recomendaciones de Producción

1. **HTTPS Obligatorio**
   ```env
   APP_URL=https://tu-dominio.com
   SANCTUM_STATEFUL_DOMAINS=tu-dominio.com
   ```

2. **Variables de Entorno Seguras**
   ```env
   APP_KEY=base64:random_key_here
   DB_PASSWORD=secure_password_here
   PUSHER_APP_SECRET=secure_secret_here
   ```

3. **Configuración de Producción**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   LOG_LEVEL=warning
   ```

---

## 📞 Soporte

Para soporte técnico o consultas sobre la API:

- **Documentación completa**: Ver `/docs/WEBSOCKET_SETUP.md`
- **Logs de desarrollo**: Ver `/docs/DEVELOPMENT_LOG.md`
- **Configuración**: Ver `README.md`

**Información de la API:**
- **Versión**: 1.0
- **Última actualización**: 26 de noviembre de 2025
- **Laravel**: 11.x
- **PHP**: 8.2+