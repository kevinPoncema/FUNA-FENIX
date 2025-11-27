<?php

namespace Database\Seeders;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FeedbackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todos los team members existentes
        $teamMembers = TeamMember::all();

        // Obtener un usuario admin para ser el owner por defecto
        $adminUser = User::where('email', 'admin@admin.com')->first();

        if (!$adminUser) {
            $this->command->warn('Usuario admin no encontrado. Creando uno temporal...');
            $adminUser = User::factory()->create([
                'name' => 'Admin Temporal',
                'email' => 'admin@admin.com',
                'password' => bcrypt('password')
            ]);
        }

        if ($teamMembers->isEmpty()) {
            $this->command->warn('No hay team members. Creando algunos de ejemplo...');
            $teamMembers = TeamMember::factory(5)->create();
        }

        $categories = ['achievements', 'qualities', 'potential'];
        $feedbacksPerCategory = 12; // 12 feedbacks por categoría por miembro

        $this->command->info("Creando feedbacks para {$teamMembers->count()} miembros del equipo...");

        foreach ($teamMembers as $member) {
            $this->command->info("Creando feedbacks para: {$member->name}");

            foreach ($categories as $category) {
                $this->command->info("  - Creando {$feedbacksPerCategory} feedbacks de categoría '{$category}'");

                Feedback::factory()
                    ->count($feedbacksPerCategory)
                    ->for($member, 'target') // Establece target_id
                    ->for($adminUser, 'owner') // Establece owner_id
                    ->$category() // Usa el método específico de la categoría
                    ->create();
            }
        }

        $totalFeedbacks = $teamMembers->count() * count($categories) * $feedbacksPerCategory;
        $this->command->info("✅ Se crearon {$totalFeedbacks} feedbacks exitosamente!");
        $this->command->info("   - {$teamMembers->count()} miembros del equipo");
        $this->command->info("   - 3 categorías (achievements, qualities, potential)");
        $this->command->info("   - {$feedbacksPerCategory} feedbacks por categoría por miembro");
    }
}
