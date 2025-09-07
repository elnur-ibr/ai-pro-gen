<?php

namespace App\Http\Controllers;

use App\Models\Process;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProcessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $processes = Process::with('project')->get();
        return Inertia::render('processes/index', [
            'processes' => $processes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $projects = Project::all();
        return Inertia::render('processes/create', [
            'projects' => $projects
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debug: Log the incoming request data
        \Log::info('Process store request data:', $request->all());
        
        $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'visualization_data' => 'required|array',
        ]);

        $process = Process::create([
            'name' => $request->name,
            'project_id' => $request->project_id,
            'visualization_data' => $request->visualization_data,
        ]);

        \Log::info('Process created successfully with ID:', ['id' => $process->id]);

        return redirect()->route('processes.index')
            ->with('success', 'Process created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Process $process)
    {
        $process->load('project');
        return Inertia::render('processes/show', [
            'process' => $process
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Process $process)
    {
        $projects = Project::all();
        $process->load('project');
        return Inertia::render('processes/edit', [
            'process' => $process,
            'projects' => $projects
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Process $process)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'visualization_data' => 'required|array',
        ]);

        $process->update([
            'name' => $request->name,
            'project_id' => $request->project_id,
            'visualization_data' => $request->visualization_data,
        ]);

        return redirect()->route('processes.index')
            ->with('success', 'Process updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Process $process)
    {
        $process->delete();

        return redirect()->route('processes.index')
            ->with('success', 'Process deleted successfully.');
    }
}
