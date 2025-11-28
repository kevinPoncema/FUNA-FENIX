<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Services\TeamMemberServices;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DataExportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:export {path?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export all team members with their associated feedbacks to JSON file';

    protected TeamMemberServices $teamMemberServices;

    public function __construct(TeamMemberServices $teamMemberServices)
    {
        parent::__construct();
        $this->teamMemberServices = $teamMemberServices;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('   Starting data export...');

        try {
            // Obtener todos los miembros con sus feedbacks
            $teamMembers = $this->teamMemberServices->getAllTeamMembersWithFeedbacks();

            // Preparar datos para exportación
            $exportData = [
                'export_date' => Carbon::now()->toISOString(),
                'total_members' => $teamMembers->count(),
                'total_feedbacks' => $teamMembers->sum(fn($member) => $member->feedbacks->count()),
                'data' => $teamMembers->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'role' => $member->role,
                        'created_at' => $member->created_at,
                        'updated_at' => $member->updated_at,
                        'feedbacks' => $member->feedbacks->map(function ($feedback) {
                            return [
                                'id' => $feedback->id,
                                'target_id' => $feedback->target_id,
                                'owner_id' => $feedback->owner_id,
                                'category' => $feedback->category,
                                'title' => $feedback->title,
                                'text' => $feedback->text,
                                'created_at' => $feedback->created_at,
                                'updated_at' => $feedback->updated_at,
                                'owner' => [
                                    'id' => $feedback->owner->id,
                                    'name' => $feedback->owner->name,
                                    'email' => $feedback->owner->email,
                                    'role' => $feedback->owner->role,
                                ]
                            ];
                        })
                    ];
                })
            ];

            // Determinar ruta del archivo
            $path = $this->argument('path');
            if (!$path) {
                $path = 'exports/fenix_data_' . Carbon::now()->format('Y-m-d_H-i-s') . '.json';
            }

            // Verificar si es una ruta absoluta o relativa
            if (str_starts_with($path, '/')) {
                // Ruta absoluta
                $fullPath = $path;
                $directory = dirname($fullPath);

                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }

                file_put_contents($fullPath, json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                $this->info("Data exported to: {$fullPath}");
            } else {
                // Ruta relativa usando Storage
                $directory = dirname($path);
                if ($directory !== '.' && !Storage::disk('local')->exists($directory)) {
                    Storage::disk('local')->makeDirectory($directory);
                }

                Storage::disk('local')->put($path, json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                $storagePath = storage_path("app/{$path}");
                $this->info("📁 Data exported to: {$storagePath}");

                // Verificar que el archivo se creó correctamente
                if (Storage::disk('local')->exists($path)) {
                    $fileSize = Storage::disk('local')->size($path);
                    $this->info("✅ File created successfully ({$fileSize} bytes)");

                    // Mostrar ruta relativa desde el proyecto
                    $relativePath = "backend/src/storage/app/{$path}";
                    $this->info("📍 Relative path from project root: {$relativePath}");
                } else {
                    $this->error("❌ File was not created successfully");
                    return 1;
                }
            }

            $this->info("Export completed successfully!");
            $this->info("Exported {$exportData['total_members']} team members with {$exportData['total_feedbacks']} feedbacks");

        } catch (\Exception $e) {
            $this->error("Export failed: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }
}
