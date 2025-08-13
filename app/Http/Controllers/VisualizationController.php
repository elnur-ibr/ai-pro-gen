<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenAI\Laravel\Facades\OpenAI;

class VisualizationController extends Controller
{
    public function generateVisualization(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
        ]);

        $prompt = $request->input('prompt');
        
        // Here you would integrate with your preferred AI service
        // For now, returning a mock response
        $visualization = $this->callAIService($prompt);

        return response()->json([
            'success' => true,
            'visualization' => $visualization,
            'prompt' => $prompt,
        ]);
    }

    private function callAIService(string $prompt): string
    {
        try {
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a process visualization expert. Create a clear, step-by-step process diagram based on the user\'s prompt. Format your response as a structured list with numbered steps.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 500,
            ]);

            return $result->choices[0]->message->content;
        } catch (\Exception $e) {
            return "Error generating visualization: " . $e->getMessage();
        }
    }
}