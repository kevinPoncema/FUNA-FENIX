# 📡 API Documentation - FUNA FENIX Backend

## Descripción General

El backend de FUNA FENIX es una API REST construida con Laravel 11 que proporciona servicios para la gestión de retroalimentación de equipos. Utiliza autenticación basada en tokens con Laravel Sanctum y broadcasting en tiempo real con Soketi.

## Autenticación

Todas las rutas protegidas requieren un token Bearer en el header `Authorization`.

### Endpoints de Autenticación

#### POST /api/auth/login-admin
Autenticación para usuarios administradores.

**Request:**
```json
{
  "email": "admin@admin.com",
  "password": "admin"
}
```

**Response Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@admin.com",
    "role": "admin"
  },
  "token": "1|laravel_sanctum_token...",
  "role": "admin"
}
```

**Response Error (401):**
```json
{
  "error": "Credenciales inválidas"
}
```

#### POST /api/auth/login-guest
Autenticación para invitados anónimos.

**Request:**
```json
{
  "name": "Usuario Invitado", // Opcional
  "hash": "unique_guest_hash" // Opcional
}
```

**Response Success (200):**
```json
{
  "user": {
    "id": 2,
    "name": "Usuario Invitado",
    "email": null,
    "role": "guest",
    "guest_hash": "generated_hash"
  },
  "token": "2|laravel_sanctum_token..."
}
```

#### POST /api/auth/logout
Cierra la sesión del usuario actual.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

#### GET /api/user
Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Administrator",
  "email": "admin@admin.com",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Team Members API

### GET /api/team-members
Obtiene todos los miembros del equipo. **Requiere rol admin.**

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "role": "Desarrollador Full Stack",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### GET /api/team-members-with-feedbacks
Obtiene todos los miembros con sus feedbacks. **Accesible para usuarios autenticados.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "role": "Desarrollador Full Stack",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z",
    "feedbacks": [
      {
        "id": 1,
        "target_id": 1,
        "owner_id": 2,
        "category": "achievements",
        "title": "Excelente trabajo",
        "text": "Ha demostrado un gran compromiso con el proyecto.",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "owner": {
          "id": 2,
          "name": "María García",
          "email": "maria@example.com",
          "role": "admin"
        }
      }
    ]
  }
]
```

### POST /api/team-members
Crea un nuevo miembro del equipo. **Requiere rol admin.**

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Ana López",
  "role": "QA Tester"
}
```

**Response Success (201):**
```json
{
  "id": 2,
  "name": "Ana López",
  "role": "QA Tester",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Response Validation Error (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["El campo nombre es obligatorio."],
    "role": ["El campo rol es obligatorio."]
  }
}
```

### PUT /api/team-members/{id}
Actualiza un miembro del equipo existente. **Requiere rol admin.**

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Ana López Actualizada",
  "role": "Senior QA Tester"
}
```

**Response Success (200):**
```json
{
  "id": 2,
  "name": "Ana López Actualizada",
  "role": "Senior QA Tester",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T01:00:00.000000Z"
}
```

### DELETE /api/team-members/{id}
Elimina un miembro del equipo. **Requiere rol admin.**

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response Success (200):**
```json
{
  "message": "Team member deleted successfully"
}
```

**Response Not Found (404):**
```json
{
  "message": "Team member not found"
}
```

## Feedbacks API

### GET /api/feedbacks
Obtiene todos los feedbacks.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "target_id": 1,
    "owner_id": 2,
    "category": "achievements",
    "title": "Excelente trabajo",
    "text": "Ha demostrado un gran compromiso con el proyecto.",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z",
    "target": {
      "id": 1,
      "name": "Juan Pérez",
      "role": "Desarrollador Full Stack"
    },
    "owner": {
      "id": 2,
      "name": "María García",
      "email": "maria@example.com",
      "role": "admin"
    }
  }
]
```

### POST /api/feedbacks
Crea un nuevo feedback.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "target_id": 1,
  "category": "qualities",
  "title": "Gran colaborador",
  "text": "Siempre está dispuesto a ayudar a sus compañeros."
}
```

**Categorías disponibles:**
- `achievements`: Logros y éxitos
- `qualities`: Cualidades personales y profesionales  
- `potential`: Potencial de crecimiento y mejoras

**Validaciones:**
- `target_id`: Requerido, debe existir en la tabla team_members
- `category`: Requerido, debe ser uno de: achievements, qualities, potential
- `title`: Requerido, máximo 50 caracteres
- `text`: Requerido, máximo 300 caracteres

**Response Success (201):**
```json
{
  "id": 2,
  "target_id": 1,
  "owner_id": 2,
  "category": "qualities",
  "title": "Gran colaborador",
  "text": "Siempre está dispuesto a ayudar a sus compañeros.",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Response Validation Error (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "target_id": ["El campo miembro del equipo es obligatorio."],
    "category": ["La categoría seleccionada no es válida."],
    "title": ["El título no puede tener más de 50 caracteres."],
    "text": ["El contenido no puede tener más de 300 caracteres."]
  }
}
```

### GET /api/feedbacks/{id}
Obtiene un feedback específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "target_id": 1,
  "owner_id": 2,
  "category": "achievements",
  "title": "Excelente trabajo",
  "text": "Ha demostrado un gran compromiso con el proyecto.",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z",
  "target": {
    "id": 1,
    "name": "Juan Pérez",
    "role": "Desarrollador Full Stack"
  },
  "owner": {
    "id": 2,
    "name": "María García",
    "email": "maria@example.com",
    "role": "admin"
  }
}
```

### PUT /api/feedbacks/{id}
Actualiza un feedback existente. **Solo el propietario o admin pueden editar.**

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Título actualizado",
  "text": "Contenido actualizado del feedback.",
  "category": "potential"
}
```

**Response Success (200):**
```json
{
  "id": 1,
  "target_id": 1,
  "owner_id": 2,
  "category": "potential",
  "title": "Título actualizado",
  "text": "Contenido actualizado del feedback.",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T01:00:00.000000Z"
}
```

**Response Authorization Error (403):**
```json
{
  "message": "No autorizado. Solo el propietario o un administrador pueden modificar este feedback."
}
```

### DELETE /api/feedbacks/{id}
Elimina un feedback. **Solo el propietario o admin pueden eliminar.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "message": "Feedback deleted successfully"
}
```

**Response Authorization Error (403):**
```json
{
  "message": "No autorizado. Solo el propietario o un administrador pueden modificar este feedback."
}
```

## Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Sin permisos para realizar la operación
- **404 Not Found**: Recurso no encontrado
- **422 Unprocessable Entity**: Errores de validación
- **500 Internal Server Error**: Error interno del servidor

## Headers Requeridos

Para todas las rutas protegidas:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Rate Limiting

El API tiene limitaciones de velocidad configuradas:
- 60 requests por minuto por IP para rutas de autenticación
- Sin límites para rutas autenticadas (configurado en middleware)

## Manejo de Errores

Todos los errores siguen un formato consistente:

```json
{
  "message": "Descripción del error",
  "error": "Detalles técnicos del error", // Solo en modo debug
  "errors": { // Solo para errores de validación
    "campo": ["Mensaje de error específico"]
  }
}
```

## Eventos de Broadcasting

La API emite eventos en tiempo real para las siguientes operaciones:

### Feedback Events
- **feedback.created**: Se emite cuando se crea un nuevo feedback
- **feedback.updated**: Se emite cuando se actualiza un feedback
- **feedback.deleted**: Se emite cuando se elimina un feedback

### Team Member Events  
- **team-member.created**: Se emite cuando se crea un nuevo miembro
- **team-member.updated**: Se emite cuando se actualiza un miembro
- **team-member.deleted**: Se emite cuando se elimina un miembro

**Estructura del evento:**
```json
{
  "event": "feedback.created",
  "data": {
    "feedback": { /* objeto feedback completo */ }
  },
  "channel": "feedback-updates"
}
```

## Testing

Para probar la API puedes usar los siguientes comandos curl:

### Autenticación Admin
```bash
curl -X POST http://localhost:8000/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'
```

### Crear Feedback
```bash
curl -X POST http://localhost:8000/api/feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 1,
    "category": "achievements",
    "title": "Excelente trabajo",
    "text": "Ha superado todas las expectativas en el proyecto."
  }'
```

### Obtener Team Members con Feedbacks
```bash
curl -X GET http://localhost:8000/api/team-members-with-feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```
