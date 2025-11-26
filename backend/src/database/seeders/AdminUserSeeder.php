<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario Kevin si no existe
        if (!User::where('email', 'kevin.ponce@fenix.com')->exists()) {
            User::create([
                'name' => 'Kevin Ponce',
                'email' => 'kevin.ponce@fenix.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'guest_hash' => null,
                'email_verified_at' => now(),
            ]);
        }

        // Crear usuario Moys si no existe
        if (!User::where('email', 'diego.moys@fenix.com')->exists()) {
            User::create([
                'name' => 'Diego Moys',
                'email' => 'diego.moys@fenix.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'guest_hash' => null,
                'email_verified_at' => now(),
            ]);
        }

        // Crear usuario administrador por defecto si no existe
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Administrator',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'guest_hash' => null,
                'email_verified_at' => now(),
            ]);
        }
    }
}
