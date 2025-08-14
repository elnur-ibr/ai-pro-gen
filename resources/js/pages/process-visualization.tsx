import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { ProcessCanvas } from '@/components/process-canvas';

interface ProcessStep {
    processStepId: string;
    processStepDescription: string;
    nextStepIds: string[];
    decisionLabels: string[];
    shapeType: 'Start' | 'Process' | 'Decision' | 'End';
    function: string;
    description: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Process Visualization',
        href: '/process-visualization',
    },
];

export default function ProcessVisualization() {
    const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
        {
            processStepId: 'P100',
            processStepDescription: 'Get course requirements',
            nextStepIds: ['P200'],
            decisionLabels: [],
            shapeType: 'Start',
            function: 'PMO',
            description: null
        },
        {
            processStepId: 'P200',
            processStepDescription: 'Create course module',
            nextStepIds: ['P300'],
            decisionLabels: [],
            shapeType: 'Process',
            function: 'Marketing',
            description: null
        },
        {
            processStepId: 'P300',
            processStepDescription: 'Module passes review?',
            nextStepIds: ['P400', 'P500'],
            decisionLabels: ['Yes', 'No'],
            shapeType: 'Decision',
            function: 'PMO',
            description: null
        },
        {
            processStepId: 'P400',
            processStepDescription: 'Publish course',
            nextStepIds: [],
            decisionLabels: [],
            shapeType: 'Process',
            function: 'Marketing',
            description: null
        },
        {
            processStepId: 'P500',
            processStepDescription: 'Address feedback',
            nextStepIds: ['P400'],
            decisionLabels: [],
            shapeType: 'End',
            function: 'Marketing',
            description: null
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (processSteps.length === 0) return;

        setIsLoading(true);
        try {
            const prompt = `Generate a process visualization for the following process steps: ${JSON.stringify(processSteps, null, 2)}`;
            
            const res = await fetch('/api/generate-visualization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ prompt }),
            });
            
            const data = await res.json();
            setResponse(data.visualization || 'No visualization generated');
        } catch (error) {
            console.error('Error:', error);
            setResponse('Error generating visualization');
        } finally {
            setIsLoading(false);
        }
    };

    const clearVisualization = () => {
        setResponse('');
    };

    const addProcessStep = () => {
        const newId = `P${((processSteps.length + 1) * 100).toString()}`;
        const newStep: ProcessStep = {
            processStepId: newId,
            processStepDescription: '',
            nextStepIds: [],
            decisionLabels: [],
            shapeType: 'Process',
            function: '',
            description: null
        };
        setProcessSteps([...processSteps, newStep]);
    };

    const removeProcessStep = (index: number) => {
        const updatedSteps = processSteps.filter((_, i) => i !== index);
        setProcessSteps(updatedSteps);
    };

    const updateProcessStep = (index: number, field: keyof ProcessStep, value: any) => {
        const updatedSteps = [...processSteps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setProcessSteps(updatedSteps);
    };

    const updateNextStepIds = (index: number, value: string) => {
        const nextStepIds = value.split(',').map(id => id.trim()).filter(id => id !== '');
        updateProcessStep(index, 'nextStepIds', nextStepIds);
    };

    const updateDecisionLabels = (index: number, value: string) => {
        const decisionLabels = value.split(',').map(label => label.trim()).filter(label => label !== '');
        updateProcessStep(index, 'decisionLabels', decisionLabels);
    };

    const updateNextStepSelection = (index: number, selectedValues: string[] | string, isMultiple: boolean = false) => {
        let newNextSteps: string[];
        
        if (isMultiple) {
            // For Decision steps (multiple selection from select element)
            newNextSteps = Array.isArray(selectedValues) ? selectedValues : [];
        } else {
            // For single selection
            const selectedValue = Array.isArray(selectedValues) ? selectedValues[0] : selectedValues;
            newNextSteps = selectedValue ? [selectedValue] : [];
        }
        
        updateProcessStep(index, 'nextStepIds', newNextSteps);
    };

    const handleMultiSelectChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        updateNextStepSelection(index, selectedOptions, true);
    };

    const getAvailableNextSteps = (currentIndex: number) => {
        return processSteps
            .filter((_, index) => index !== currentIndex) // Exclude current step
            .map(step => step.processStepId)
            .filter(id => id.trim() !== ''); // Only include steps with IDs
    };

    const handleDragStart = (index: number, e: React.DragEvent) => {
        // Only allow drag if initiated from drag handle or row background
        const target = e.target as HTMLElement;
        const isDragHandle = target.closest('.drag-handle');
        const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'BUTTON';
        
        if (!isDragHandle && isInput) {
            e.preventDefault();
            return;
        }
        
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newProcessSteps = [...processSteps];
        const draggedItem = newProcessSteps[draggedIndex];
        
        // Remove the dragged item
        newProcessSteps.splice(draggedIndex, 1);
        
        // Insert at new position
        newProcessSteps.splice(dropIndex, 0, draggedItem);
        
        setProcessSteps(newProcessSteps);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleStepClick = (stepId: string) => {
        // Clear any existing timeout
        if (glowTimeoutRef.current) {
            clearTimeout(glowTimeoutRef.current);
        }
        
        // Set the selected step
        setSelectedStepId(stepId);
        
        // Set timeout to clear selection after 2 seconds
        glowTimeoutRef.current = setTimeout(() => {
            setSelectedStepId(null);
            glowTimeoutRef.current = null;
        }, 2000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (glowTimeoutRef.current) {
                clearTimeout(glowTimeoutRef.current);
            }
        };
    }, []);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Process Visualization" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Process Visualization</h1>
                    <p className="text-muted-foreground text-lg">
                        Define your process steps in the table and generate AI-powered visualizations
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Process Description</CardTitle>
                            <CardDescription>
                                Define your process steps with structured data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button type="button" onClick={addProcessStep} size="sm">
                                    Add Step
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={handleSubmit} 
                                    disabled={isLoading || processSteps.length === 0}
                                    className="flex-1"
                                >
                                    {isLoading ? 'Generating...' : 'Generate Visualization'}
                                </Button>
                                {response && (
                                    <Button type="button" variant="outline" onClick={clearVisualization} size="sm">
                                        Clear
                                    </Button>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto max-h-96 border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="px-2 py-2 text-left font-medium w-8"></th>
                                            <th className="px-2 py-2 text-left font-medium">Step ID</th>
                                            <th className="px-2 py-2 text-left font-medium">Description</th>
                                            <th className="px-2 py-2 text-left font-medium">Type</th>
                                            <th className="px-2 py-2 text-left font-medium">Function</th>
                                            <th className="px-2 py-2 text-left font-medium">Next Steps</th>
                                            <th className="px-2 py-2 text-left font-medium">Decision Labels</th>
                                            <th className="px-2 py-2 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processSteps.map((step, index) => (
                                            <tr 
                                                key={index} 
                                                className={`border-t ${draggedIndex === index ? 'opacity-50' : ''} hover:bg-muted/30 transition-all duration-300 ${selectedStepId === step.processStepId ? 'shadow-2xl shadow-blue-500/50 bg-blue-50/30 relative z-10' : ''}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(index, e)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <td className="px-2 py-2 text-center drag-handle cursor-move">
                                                    <span className="text-muted-foreground select-none" title="Drag to reorder">
                                                        ⋮⋮
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={step.processStepId}
                                                        onChange={(e) => updateProcessStep(index, 'processStepId', e.target.value)}
                                                        className="w-16 h-8 text-xs"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={step.processStepDescription}
                                                        onChange={(e) => updateProcessStep(index, 'processStepDescription', e.target.value)}
                                                        className="min-w-32 h-8 text-xs"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <select
                                                        value={step.shapeType}
                                                        onChange={(e) => updateProcessStep(index, 'shapeType', e.target.value as ProcessStep['shapeType'])}
                                                        className="w-20 h-8 px-2 text-xs border rounded-md bg-background"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    >
                                                        <option value="Start">Start</option>
                                                        <option value="Process">Process</option>
                                                        <option value="Decision">Decision</option>
                                                        <option value="End">End</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={step.function}
                                                        onChange={(e) => updateProcessStep(index, 'function', e.target.value)}
                                                        className="w-20 h-8 text-xs"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    {step.shapeType === 'Decision' ? (
                                                        <select
                                                            multiple
                                                            value={step.nextStepIds}
                                                            onChange={(e) => handleMultiSelectChange(index, e)}
                                                            className="w-24 h-16 px-2 text-xs border rounded-md bg-background"
                                                            size={Math.min(3, getAvailableNextSteps(index).length)}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onDragStart={(e) => e.preventDefault()}
                                                        >
                                                            {getAvailableNextSteps(index).map(stepId => (
                                                                <option key={stepId} value={stepId}>{stepId}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <select
                                                            value={step.nextStepIds[0] || ''}
                                                            onChange={(e) => updateNextStepSelection(index, e.target.value, false)}
                                                            className="w-20 h-8 px-2 text-xs border rounded-md bg-background"
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onDragStart={(e) => e.preventDefault()}
                                                        >
                                                            <option value="">None</option>
                                                            {getAvailableNextSteps(index).map(stepId => (
                                                                <option key={stepId} value={stepId}>{stepId}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={step.decisionLabels.join(', ')}
                                                        onChange={(e) => updateDecisionLabels(index, e.target.value)}
                                                        placeholder="Yes, No"
                                                        className="w-20 h-8 text-xs"
                                                        disabled={step.shapeType !== 'Decision'}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeProcessStep(index)}
                                                        className="h-8 w-8 p-0 text-xs"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onDragStart={(e) => e.preventDefault()}
                                                    >
                                                        ×
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visualization Output</CardTitle>
                            <CardDescription>
                                Your generated process visualization will appear here
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {processSteps.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white overflow-auto">
                                        <ProcessCanvas 
                                            processSteps={processSteps}
                                            width={800}
                                            height={600}
                                            onStepClick={handleStepClick}
                                            selectedStepId={selectedStepId}
                                        />
                                    </div>
                                    {response && (
                                        <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-muted/30 max-h-96 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-muted-foreground">Add process steps to see the visualization</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>How to Use</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• <strong>Step ID:</strong> Unique identifier for each process step (e.g., P100, P200)</li>
                            <li>• <strong>Description:</strong> Brief description of what happens in this step</li>
                            <li>• <strong>Type:</strong> Start (beginning), Process (action), Decision (choice), End (completion)</li>
                            <li>• <strong>Function:</strong> Department or role responsible for this step</li>
                            <li>• <strong>Next Steps:</strong> Single selection for most steps, multi-select for Decision steps (hold Ctrl/Cmd to select multiple)</li>
                            <li>• <strong>Decision Labels:</strong> For Decision steps only - labels for each path (Yes/No, Approve/Reject, etc.)</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}