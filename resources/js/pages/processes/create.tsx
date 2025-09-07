import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
}

interface Props {
    projects: Project[];
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
        title: 'Create',
        href: '/processes/create',
    },
];

export default function CreateProcess({ projects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        project_id: '',
        visualization_data: [] as ProcessStep[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a default process structure if none exists
        const defaultVisualizationData: ProcessStep[] = [
            {
                processStepId: 'P100',
                processStepDescription: 'Start Process',
                nextStepIds: ['P200'],
                decisionLabels: [],
                shapeType: 'Start',
                function: 'System',
                description: null
            },
            {
                processStepId: 'P200',
                processStepDescription: 'End Process',
                nextStepIds: [],
                decisionLabels: [],
                shapeType: 'End',
                function: 'System',
                description: null
            }
        ];

        // Set the visualization data if empty
        if (data.visualization_data.length === 0) {
            setData('visualization_data', defaultVisualizationData);
        }

        // Debug: Log the form data
        console.log('Form data being submitted:', data);
        
        // Submit the form
        post('/processes', {
            onSuccess: (page) => {
                console.log('Form submission successful', page);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
            onFinish: () => {
                console.log('Form submission finished');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Process" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/processes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">Create Process</h1>
                        <p className="text-muted-foreground">
                            Add a new process visualization
                        </p>
                    </div>
                </div>

                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Process Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.project_id && (
                                    <p className="text-sm text-destructive">{errors.project_id}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Process'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/processes">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground">
                    <p>Note: A basic process structure will be created initially. You can edit it later to add more steps and customize the visualization.</p>
                </div>
            </div>
        </AppLayout>
    );
}