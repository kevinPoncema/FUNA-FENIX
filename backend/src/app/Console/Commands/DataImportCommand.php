<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeamMember;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DataImportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:import {jsonPath?} {--format-db : Format database (delete all data) before import}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import team members and feedbacks from JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting data import...');

        try {
            // Determinar ruta del archivo JSON
            $jsonPath = $this->argument('jsonPath');
            if (!$jsonPath) {
                // Buscar el archivo más reciente en la carpeta exports
                $files = Storage::disk('local')->files('exports');
                $jsonFiles = array_filter($files, fn($file) => str_ends_with($file, '.json'));

                if (empty($jsonFiles)) {
                    $this->error("❌ No JSON files found in storage/app/exports/");
                    $this->info("💡 Please specify a JSON path or run data:export first");
                    return 1;
                }

                // Obtener el archivo más reciente
                $jsonPath = collect($jsonFiles)->sortByDesc(function ($file) {
                    return Storage::disk('local')->lastModified($file);
                })->first();

                $this->info("📁 Using most recent export file: {$jsonPath}");
            }

            // Leer archivo JSON
            $jsonData = $this->readJsonFile($jsonPath);
            if (!$jsonData) {
                return 1;
            }

            // Verificar si se debe formatear la base de datos
            if ($this->option('format-db')) {
                if ($this->confirm('⚠️  This will DELETE ALL existing data. Are you sure?')) {
                    $this->formatDatabase();
                } else {
                    $this->info('Import cancelled by user.');
                    return 0;
                }
            }

            // Importar datos
            $this->importData($jsonData);

            $this->info("✅ Import completed successfully!");

        } catch (\Exception $e) {
            $this->error("❌ Import failed: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }

    /**
     * Read JSON file from path
     */
    private function readJsonFile($jsonPath)
    {
        try {
            if (str_starts_with($jsonPath, '/')) {
                // Ruta absoluta
                if (!file_exists($jsonPath)) {
                    $this->error("❌ File not found: {$jsonPath}");
                    return false;
                }
                $jsonContent = file_get_contents($jsonPath);
            } else {
                // Ruta relativa usando Storage
                if (!Storage::disk('local')->exists($jsonPath)) {
                    $this->error("❌ File not found in storage: {$jsonPath}");
                    return false;
                }
                $jsonContent = Storage::disk('local')->get($jsonPath);
            }

            $data = json_decode($jsonContent, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->error("❌ Invalid JSON format: " . json_last_error_msg());
                return false;
            }

            $this->info("📊 Found {$data['total_members']} team members with {$data['total_feedbacks']} feedbacks");
            $this->info("📅 Export date: {$data['export_date']}");

            return $data;

        } catch (\Exception $e) {
            $this->error("❌ Error reading file: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format database - delete all data
     */
    private function formatDatabase()
    {
        $this->info('🗑️  Formatting database...');

        DB::transaction(function () {
            // Disable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Delete all feedbacks
            DB::table('feedback')->truncate();
            $this->info('   ✅ Cleared feedback table');

            // Delete all team members
            DB::table('team_members')->truncate();
            $this->info('   ✅ Cleared team_members table');

            // Reset auto increment
            DB::statement('ALTER TABLE feedback AUTO_INCREMENT = 1;');
            DB::statement('ALTER TABLE team_members AUTO_INCREMENT = 1;');

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        });

        $this->info('✅ Database formatted successfully');
    }

    /**
     * Import data from JSON
     */
    private function importData($jsonData)
    {
        $this->info('📥 Importing data...');

        DB::transaction(function () use ($jsonData) {
            $importedMembers = 0;
            $importedFeedbacks = 0;

            foreach ($jsonData['data'] as $memberData) {
                // Crear o encontrar team member
                $teamMember = TeamMember::firstOrCreate(
                    ['name' => $memberData['name']],
                    [
                        'role' => $memberData['role'],
                        'created_at' => $memberData['created_at'],
                        'updated_at' => $memberData['updated_at']
                    ]
                );

                $importedMembers++;
                $this->info("   👤 Imported member: {$teamMember->name} ({$teamMember->role})");

                // Importar feedbacks del miembro
                foreach ($memberData['feedbacks'] as $feedbackData) {
                    // Verificar que el usuario owner existe
                    $owner = User::find($feedbackData['owner_id']);
                    if (!$owner) {
                        $this->warn("   ⚠️  Skipping feedback - Owner user not found (ID: {$feedbackData['owner_id']})");
                        continue;
                    }

                    // Crear feedback si no existe
                    $feedback = Feedback::firstOrCreate(
                        [
                            'target_id' => $teamMember->id,
                            'owner_id' => $feedbackData['owner_id'],
                            'title' => $feedbackData['title']
                        ],
                        [
                            'category' => $feedbackData['category'],
                            'text' => $feedbackData['text'],
                            'created_at' => $feedbackData['created_at'],
                            'updated_at' => $feedbackData['updated_at']
                        ]
                    );

                    $importedFeedbacks++;
                    $this->info("      💬 Imported feedback: {$feedback->title} ({$feedback->category})");
                }
            }

            $this->info("✅ Imported {$importedMembers} team members and {$importedFeedbacks} feedbacks");
        });
    }
}
