import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProcessCanvas } from '@/components/process-canvas';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Workflow } from 'lucide-react';

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
        title: 'Process Details',
        href: '#',
    },
];

export default function ShowProcess({ process }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${process.name}"?`)) {
            router.delete(`/processes/${process.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Process: ${process.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/processes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Workflow className="h-6 w-6" />
                            <h1 className="text-2xl font-semibold">{process.name}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{process.project.name}</Badge>
                            <Badge variant="outline">
                                {process.visualization_data.length} steps
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/processes/${process.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Process Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                                <p className="text-lg">{process.name}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Project</h3>
                                <p>{process.project.name}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Steps</h3>
                                <p>{process.visualization_data.length}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                                <p className="text-sm">{formatDate(process.created_at)}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                                <p className="text-sm">{formatDate(process.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Process Visualization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[400px] border rounded-lg p-4">
                                <ProcessCanvas processSteps={process.visualization_data} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Process Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {process.visualization_data.map((step, index) => (
                                <div key={step.processStepId} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-4 mb-2">
                                        <Badge variant="outline">{step.processStepId}</Badge>
                                        <Badge variant={
                                            step.shapeType === 'Start' ? 'default' :
                                            step.shapeType === 'End' ? 'destructive' :
                                            step.shapeType === 'Decision' ? 'secondary' :
                                            'outline'
                                        }>
                                            {step.shapeType}
                                        </Badge>
                                        <Badge variant="secondary">{step.function}</Badge>
                                    </div>
                                    <h4 className="font-medium">{step.processStepDescription}</h4>
                                    {step.nextStepIds.length > 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Next: {step.nextStepIds.join(', ')}
                                        </p>
                                    )}
                                    {step.decisionLabels.length > 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Options: {step.decisionLabels.join(', ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}