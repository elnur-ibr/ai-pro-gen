import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
}

interface ProcessStep {
    processStepId: string;
    processStepDescription: string;
    nextStepIds: string[];
    decisionLabels: string[];
    shapeType: 'Start' | 'Process' | 'Decision' | 'End';
    function: string;
    description: string | null;
}

interface Process {
    id: number;
    name: string;
    project: Project;
    visualization_data: ProcessStep[];
    created_at: string;
    updated_at: string;
}

interface Props {
    process: Process;
    projects: Project[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Processes',
        href: '/processes',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function EditProcess({ process, projects }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: process.name,
        project_id: process.project.id.toString(),
        visualization_data: process.visualization_data,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/processes/${process.id}`);
    };

    const addStep = () => {
        const newStep: ProcessStep = {
            processStepId: `P${(data.visualization_data.length + 1) * 100}`,
            processStepDescription: 'New Step',
            nextStepIds: [],
            decisionLabels: [],
            shapeType: 'Process',
            function: 'System',
            description: null
        };
        
        setData('visualization_data', [...data.visualization_data, newStep]);
    };

    const removeStep = (index: number) => {
        const newSteps = data.visualization_data.filter((_, i) => i !== index);
        setData('visualization_data', newSteps);
    };

    const updateStep = (index: number, field: keyof ProcessStep, value: any) => {
        const newSteps = [...data.visualization_data];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setData('visualization_data', newSteps);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Process: ${process.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/processes/${process.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">Edit Process</h1>
                        <p className="text-muted-foreground">
                            Update process information and visualization
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Process Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Process Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter process name"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="project">Project</Label>
                                <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)}>
                                    <SelectTrigger className={errors.project_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((proj) => (
                                            <SelectItem key={proj.id} value={proj.id.toString()}>
                                                {proj.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.project_id && (
                                    <p className="text-sm text-destructive">{errors.project_id}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Process Steps</CardTitle>
                            <Button type="button" onClick={addStep} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Step
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.visualization_data.map((step, index) => (
                                <Card key={index}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <h4 className="font-medium">Step {index + 1}</h4>
                                        {data.visualization_data.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeStep(index)}
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Step ID</Label>
                                            <Input
                                                value={step.processStepId}
                                                onChange={(e) => updateStep(index, 'processStepId', e.target.value)}
                                                placeholder="e.g., P100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Shape Type</Label>
                                            <Select
                                                value={step.shapeType}
                                                onValueChange={(value) => updateStep(index, 'shapeType', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Start">Start</SelectItem>
                                                    <SelectItem value="Process">Process</SelectItem>
                                                    <SelectItem value="Decision">Decision</SelectItem>
                                                    <SelectItem value="End">End</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={step.processStepDescription}
                                                onChange={(e) => updateStep(index, 'processStepDescription', e.target.value)}
                                                placeholder="Describe this step"
                                                rows={2}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Function</Label>
                                            <Input
                                                value={step.function}
                                                onChange={(e) => updateStep(index, 'function', e.target.value)}
                                                placeholder="e.g., Marketing, PMO"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Next Step IDs</Label>
                                            <Input
                                                value={step.nextStepIds.join(', ')}
                                                onChange={(e) => updateStep(index, 'nextStepIds', e.target.value.split(', ').filter(Boolean))}
                                                placeholder="e.g., P200, P300"
                                            />
                                        </div>
                                        {step.shapeType === 'Decision' && (
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Decision Labels</Label>
                                                <Input
                                                    value={step.decisionLabels.join(', ')}
                                                    onChange={(e) => updateStep(index, 'decisionLabels', e.target.value.split(', ').filter(Boolean))}
                                                    placeholder="e.g., Yes, No"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Process'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/processes/${process.id}`}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}