<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create specific user for login
        User::create([
            'name' => 'Elnur Ibrahim-zade',
            'email' => 'elnur.ibrahim-zade@hotmail.com',
            'password' => 'password',
        ]);
    }
}
