<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VisualizationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('generate-visualization', [VisualizationController::class, 'generateVisualization'])
    ->name('api.generate-visualization');