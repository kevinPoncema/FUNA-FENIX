# 🏗️ Backend Architecture - FUNA FENIX

## Descripción General

El backend de FUNA FENIX sigue una arquitectura MVC (Model-View-Controller) mejorada con patrones adicionales como Repository, Service Layer y Event-Driven Architecture. Está construido sobre Laravel 11 y utiliza principios SOLID y Clean Architecture.

## Estructura de Directorios

```
backend/src/
├── app/
│   ├── Events/                    # Eventos de broadcasting
│   ├── Http/
│   │   ├── Controllers/          # Controladores de API
│   │   ├── Middleware/           # Middleware personalizado
│   │   ├── Requests/             # Form Request Validation
│   │   └── Services/             # Capa de servicios de negocio
│   ├── Models/                   # Modelos Eloquent
│   ├── Providers/                # Service Providers
│   └── Repositories/             # Patrón Repository
├── bootstrap/                    # Archivos de bootstrap
├── config/                       # Archivos de configuración
├── database/
│   ├── factories/               # Factory para testing
│   ├── migrations/              # Migraciones de BD
│   └── seeders/                 # Seeders para datos iniciales
├── public/                      # Punto de entrada web
├── resources/                   # Recursos (views, assets)
├── routes/                      # Definición de rutas
├── storage/                     # Archivos generados
├── tests/                       # Tests unitarios y feature
└── vendor/                      # Dependencias de Composer
```

## Patrón de Arquitectura

### 1. Request Flow (Flujo de Request)

```
Request → Middleware → Controller → Service → Repository → Model → Database
                ↓
Response ← View/JSON ← Controller ← Service ← Repository ← Model ← Database
```

### 2. Event Broadcasting Flow

```
Action → Service → Event → Queue → Broadcasting → WebSocket → Client
```

## Componentes Principales

### Models (app/Models/)

Los modelos representan las entidades de datos y sus relaciones.

#### User.php
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'guest_hash'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relación: Usuario puede tener muchos feedbacks como propietario
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class, 'owner_id');
    }

    // Scope para admins
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    // Accessor para verificar si es admin
    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }
}
```

#### TeamMember.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'role'];

    // Relación: Un miembro puede tener muchos feedbacks
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class, 'target_id');
    }

    // Scope para búsquedas
    public function scopeByRole($query, $role)
    {
        return $query->where('role', 'like', "%{$role}%");
    }
}
```

#### Feedback.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback';

    protected $fillable = [
        'target_id', 'owner_id', 'category', 'title', 'text'
    ];

    protected $casts = [
        'category' => 'string',
    ];

    // Relación: Feedback pertenece a un TeamMember (target)
    public function target(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'target_id');
    }

    // Relación: Feedback pertenece a un User (owner)
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Scope por categoría
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Scope para feedbacks recientes
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
```

### Repositories (app/Repositories/)

Los repositories encapsulan la lógica de acceso a datos.

#### FeedbackRepo.php
```php
<?php

namespace App\Repositories;

use App\Models\Feedback;

class FeedbackRepo
{
    // Crear nuevo feedback
    public function createFeedback(array $data): Feedback
    {
        return Feedback::create($data);
    }

    // Obtener feedback por ID con relaciones
    public function getFeedbackById(string $id): Feedback
    {
        return Feedback::with(['target', 'owner'])->findOrFail($id);
    }

    // Actualizar feedback
    public function updateFeedback(string $id, array $data): Feedback
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->update($data);
        return $feedback->load(['target', 'owner']);
    }

    // Eliminar feedback
    public function deleteFeedback(string $id): bool
    {
        $feedback = Feedback::findOrFail($id);
        return $feedback->delete();
    }

    // Obtener todos los feedbacks con relaciones
    public function getAllFeedbacks()
    {
        return Feedback::with(['target', 'owner'])->get();
    }

    // Obtener feedbacks por categoría
    public function getFeedbacksByCategory(string $category)
    {
        return Feedback::with(['target', 'owner'])
            ->byCategory($category)
            ->get();
    }

    // Obtener feedbacks recientes
    public function getRecentFeedbacks(int $days = 7)
    {
        return Feedback::with(['target', 'owner'])
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
```

#### TeamMemberRepo.php
```php
<?php

namespace App\Repositories;

use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Collection;

class TeamMemberRepo
{
    // Obtener todos los team members
    public function getAllTeamMembers(): Collection
    {
        return TeamMember::all();
    }

    // Obtener team member por ID
    public function getTeamMemberById(int $id): TeamMember
    {
        return TeamMember::findOrFail($id);
    }

    // Crear nuevo team member
    public function createTeamMember(array $data): TeamMember
    {
        return TeamMember::create($data);
    }

    // Actualizar team member
    public function updateTeamMember(int $id, array $data): TeamMember
    {
        $teamMember = TeamMember::findOrFail($id);
        $teamMember->update($data);
        return $teamMember;
    }

    // Eliminar team member
    public function deleteTeamMember(int $id): bool
    {
        $teamMember = TeamMember::findOrFail($id);
        return $teamMember->delete();
    }

    // Obtener team members con sus feedbacks
    public function getAllTeamMembersWithFeedbacks(): Collection
    {
        return TeamMember::with(['feedbacks.owner'])->get();
    }

    // Buscar team members por rol
    public function getTeamMembersByRole(string $role): Collection
    {
        return TeamMember::byRole($role)->get();
    }
}
```

### Services (app/Http/Services/)

La capa de servicios contiene la lógica de negocio.

#### FeedbackServices.php
```php
<?php

namespace App\Http\Services;

use App\Repositories\FeedbackRepo;
use App\Events\FeedbackCreated;
use App\Events\FeedbackUpdated;
use App\Events\FeedbackDeleted;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;

class FeedbackServices
{
    protected FeedbackRepo $feedbackRepo;

    public function __construct(FeedbackRepo $feedbackRepo)
    {
        $this->feedbackRepo = $feedbackRepo;
    }

    // Crear feedback con validación y evento
    public function createFeedback(array $data)
    {
        // Asignar automáticamente el owner_id al usuario autenticado
        $data['owner_id'] = auth()->id();
        
        $feedback = $this->feedbackRepo->createFeedback($data);
        
        // Disparar evento para broadcasting
        event(new FeedbackCreated($feedback));
        
        return $feedback;
    }

    // Obtener feedback por ID
    public function getFeedbackById(string $id)
    {
        return $this->feedbackRepo->getFeedbackById($id);
    }

    // Actualizar feedback con validación de propiedad
    public function updateFeedback(string $id, array $data)
    {
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        $this->validateOwnership($feedback);
        
        $updatedFeedback = $this->feedbackRepo->updateFeedback($id, $data);
        
        // Disparar evento para broadcasting
        event(new FeedbackUpdated($updatedFeedback));
        
        return $updatedFeedback;
    }

    // Eliminar feedback con validación de propiedad
    public function deleteFeedback(string $id)
    {
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        $this->validateOwnership($feedback);
        
        $this->feedbackRepo->deleteFeedback($id);
        
        // Disparar evento para broadcasting
        event(new FeedbackDeleted($id));
    }

    // Obtener todos los feedbacks
    public function getAllFeedbacks()
    {
        return $this->feedbackRepo->getAllFeedbacks();
    }

    // Validar que el usuario actual sea el owner del feedback o sea admin
    private function validateOwnership($feedback)
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            throw new AuthenticationException('Usuario no autenticado');
        }

        // Permitir si es el propietario del feedback
        if ($feedback->owner_id === $currentUser->id) {
            return;
        }

        // Permitir si es admin
        if ($currentUser->role === 'admin') {
            return;
        }

        // Si no es ni propietario ni admin, denegar acceso
        throw new AuthorizationException('No autorizado. Solo el propietario o un administrador pueden modificar este feedback.');
    }
}
```

#### AuthService.php
```php
<?php

namespace App\Http\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    // Login para administradores
    public function loginAdmin(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new AuthenticationException('Credenciales inválidas');
        }

        if ($user->role !== 'admin') {
            throw new AuthorizationException('Acceso denegado. Solo administradores pueden acceder.');
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    // Login para invitados
    public function loginGuest(string $name, ?string $hash = null): array
    {
        $guestHash = $hash ?? uniqid('guest_', true);

        // Buscar usuario invitado existente o crear uno nuevo
        $user = User::firstOrCreate(
            ['guest_hash' => $guestHash],
            [
                'name' => $name,
                'role' => 'guest',
                'email' => null,
                'password' => null,
                'guest_hash' => $guestHash
            ]
        );

        $token = $user->createToken('guest-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }
}
```

### Controllers (app/Http/Controllers/Api/)

Los controladores manejan las peticiones HTTP y coordinan la respuesta.

#### FeedbackController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Services\FeedbackServices;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackRequest;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    protected FeedbackServices $feedbackServices;

    public function __construct(FeedbackServices $feedbackServices)
    {
        $this->feedbackServices = $feedbackServices;
    }

    // GET /api/feedbacks
    public function index(): JsonResponse
    {
        try {
            $feedbacks = $this->feedbackServices->getAllFeedbacks();
            return response()->json($feedbacks, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving feedbacks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // POST /api/feedbacks
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->createFeedback($request->validated());
            return response()->json($feedback, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/feedbacks/{id}
    public function show(string $id): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->getFeedbackById($id);
            return response()->json($feedback, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Feedback not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    // PUT /api/feedbacks/{id}
    public function update(UpdateFeedbackRequest $request, string $id): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->updateFeedback($id, $request->validated());
            return response()->json($feedback, 200);
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/feedbacks/{id}
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->feedbackServices->deleteFeedback($id);
            return response()->json([
                'message' => 'Feedback deleted successfully'
            ], 200);
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Events (app/Events/)

Los eventos manejan el broadcasting en tiempo real.

#### FeedbackCreated.php
```php
<?php

namespace App\Events;

use App\Models\Feedback;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Feedback $feedback;

    public function __construct(Feedback $feedback)
    {
        $this->feedback = $feedback->load(['target', 'owner']);
    }

    // Definir el canal de broadcasting
    public function broadcastOn(): array
    {
        return [
            new Channel('feedback-updates'),
        ];
    }

    // Nombre del evento en el cliente
    public function broadcastAs(): string
    {
        return 'feedback.created';
    }

    // Datos que se envían al cliente
    public function broadcastWith(): array
    {
        return [
            'feedback' => $this->feedback,
        ];
    }
}
```

### Middleware (app/Http/Middleware/)

#### IsAdmin.php
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        return $next($request);
    }
}
```

### Request Validation (app/Http/Requests/)

#### StoreFeedbackRequest.php
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'target_id' => 'required|exists:team_members,id',
            'category' => 'required|in:achievements,qualities,potential',
            'title' => 'required|string|max:50',
            'text' => 'required|string|max:300',
        ];
    }

    public function messages(): array
    {
        return [
            'target_id.required' => 'El campo miembro del equipo es obligatorio.',
            'target_id.exists' => 'El miembro del equipo seleccionado no existe.',
            'category.required' => 'El campo categoría es obligatorio.',
            'category.in' => 'La categoría seleccionada no es válida.',
            'title.required' => 'El campo título es obligatorio.',
            'title.max' => 'El título no puede tener más de 50 caracteres.',
            'text.required' => 'El contenido del feedback es obligatorio.',
            'text.max' => 'El contenido no puede tener más de 300 caracteres.',
        ];
    }
}
```

## Database Layer

### Migrations (database/migrations/)

#### create_feedback_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('target_id')->constrained('team_members')->cascadeOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->enum('category', ['achievements', 'qualities', 'potential']);
            $table->string('title', 50);
            $table->string('text', 300);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
```

### Factories (database/factories/)

#### FeedbackFactory.php
```php
<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeedbackFactory extends Factory
{
    protected $model = Feedback::class;

    public function definition(): array
    {
        $category = fake()->randomElement(['achievements', 'qualities', 'potential']);

        return [
            'target_id' => TeamMember::factory(),
            'owner_id' => User::factory(),
            'category' => $category,
            'title' => $this->getTitleByCategory($category),
            'text' => $this->getTextByCategory($category),
        ];
    }

    // Métodos auxiliares para generar contenido contextual
    private function getTitleByCategory(string $category): string
    {
        // Implementación de títulos específicos por categoría
    }

    // Estados específicos para cada categoría
    public function achievements(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'achievements',
        ]);
    }
}
```

### Seeders (database/seeders/)

#### FeedbackSeeder.php
```php
<?php

namespace Database\Seeders;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class FeedbackSeeder extends Seeder
{
    public function run(): void
    {
        $teamMembers = TeamMember::all();
        $adminUser = User::where('email', 'admin@admin.com')->first();

        if ($teamMembers->isEmpty()) {
            $teamMembers = TeamMember::factory(5)->create();
        }

        $categories = ['achievements', 'qualities', 'potential'];
        $feedbacksPerCategory = 12;

        foreach ($teamMembers as $member) {
            foreach ($categories as $category) {
                Feedback::factory()
                    ->count($feedbacksPerCategory)
                    ->for($member, 'target')
                    ->for($adminUser, 'owner')
                    ->$category()
                    ->create();
            }
        }
    }
}
```

## Routing (routes/)

### api.php
```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\TeamMemberController;

// Rutas públicas de autenticación
Route::post('auth/login-admin', [AuthController::class, 'loginAdmin']);
Route::post('auth/login-guest', [AuthController::class, 'loginGuest']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de usuario autenticado
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    
    // Rutas de feedbacks (accesibles para usuarios autenticados)
    Route::apiResource('feedbacks', FeedbackController::class);
    Route::get('team-members-with-feedbacks', [TeamMemberController::class, 'indexWithFeedbacks']);
    
    // Rutas de admin solamente
    Route::middleware('isAdmin')->group(function () {
        Route::apiResource('team-members', TeamMemberController::class);
    });
});
```

### channels.php
```php
<?php

use Illuminate\Support\Facades\Broadcast;

// Canales públicos para actualizaciones en tiempo real
Broadcast::channel('feedback-updates', function () {
    return true; // Público para usuarios autenticados
});

Broadcast::channel('team-updates', function () {
    return true; // Público para usuarios autenticados
});
```

## Dependency Injection

Laravel utiliza un contenedor de dependencias robusto. Los servicios se resuelven automáticamente:

```php
// En el constructor del controlador
public function __construct(FeedbackServices $feedbackServices)
{
    $this->feedbackServices = $feedbackServices; // Auto-inyectado
}

// En el constructor del servicio
public function __construct(FeedbackRepo $feedbackRepo)
{
    $this->feedbackRepo = $feedbackRepo; // Auto-inyectado
}
```

## Testing Strategy

### Feature Tests (tests/Feature/)
```php
<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    public function test_authenticated_user_can_create_feedback()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $teamMember = TeamMember::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/feedbacks', [
                'target_id' => $teamMember->id,
                'category' => 'achievements',
                'title' => 'Test feedback',
                'text' => 'This is a test feedback'
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'target_id', 'owner_id', 'category', 'title', 'text'
            ]);

        $this->assertDatabaseHas('feedback', [
            'title' => 'Test feedback',
            'owner_id' => $user->id
        ]);
    }
}
```

## Principios de Diseño

### 1. Single Responsibility Principle (SRP)
Cada clase tiene una responsabilidad única:
- **Repositories**: Solo acceso a datos
- **Services**: Solo lógica de negocio
- **Controllers**: Solo manejo de HTTP
- **Models**: Solo representación de entidades

### 2. Dependency Inversion Principle (DIP)
Las clases dependen de abstracciones, no de implementaciones concretas.

### 3. Open/Closed Principle (OCP)
El código está abierto para extensión pero cerrado para modificación.

### 4. Interface Segregation Principle (ISP)
Las interfaces son específicas y no fuerzan implementaciones innecesarias.

### 5. Separation of Concerns
Cada capa tiene responsabilidades bien definidas y separadas.

## Performance Considerations

### 1. Eager Loading
```php
// Evitar N+1 queries
Feedback::with(['target', 'owner'])->get();
```

### 2. Database Indexing
```php
// En migraciones
$table->index(['category', 'target_id']);
$table->index(['owner_id']);
$table->index(['created_at']);
```

### 3. Query Optimization
```php
// Usar scopes para queries comunes
public function scopeRecent($query, $days = 7)
{
    return $query->where('created_at', '>=', now()->subDays($days));
}
```

### 4. Caching Strategy
```php
// Cache de datos frecuentes
Cache::remember('team_members', 3600, function () {
    return TeamMember::all();
});
```

Esta arquitectura proporciona una base sólida, mantenible y escalable para el backend de FUNA FENIX, siguiendo las mejores prácticas de Laravel y principios de software engineering.
