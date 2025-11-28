<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class HashUserNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:hash-user-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Obtener todos los usuarios con rol 'guest'
        $guests = User::where('role', 'guest')->get();
        // Filtrar los usuarios cuyo nombre no tenga 64 caracteres
        $noHashed = $this->noHashedUsers($guests);
        $updated = 0;
        foreach ($noHashed as $user) {
            $hashedName = hash('sha256', $user->name);
            $user->name = $hashedName;
            $user->save();
            $updated++;
        }
        $this->info("Usuarios actualizados: {$updated}");
    }

    /**
     * Filtra usuarios cuyo nombre no tiene 64 caracteres (no hasheados)
     * @param \Illuminate\Support\Collection $users
     * @return \Illuminate\Support\Collection
     */
    protected function noHashedUsers($users)
    {
        return $users->filter(function ($user) {
            return strlen($user->name) !== 64;
        });
    }
}
