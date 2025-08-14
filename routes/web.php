<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\VisualizationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('process-visualization', function () {
        return Inertia::render('process-visualization');
    })->name('process-visualization');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
