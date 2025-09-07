import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Eye, Workflow } from 'lucide-react';

interface Project {
    id: number;
    name: string;
}

interface Process {
    id: number;
    name: string;
    project: Project;
    visualization_data: any[];
    created_at: string;
    updated_at: string;
}

interface Props {
    processes: Process[];
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
];

export default function ProcessesIndex({ processes }: Props) {
    const handleDelete = (process: Process) => {
        if (confirm(`Are you sure you want to delete "${process.name}"?`)) {
            router.delete(`/processes/${process.id}`);
        }
    };

    const getStepCount = (visualizationData: any[]) => {
        return Array.isArray(visualizationData) ? visualizationData.length : 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Processes" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">Processes</h1>
                        <p className="text-muted-foreground">
                            Manage your process visualizations
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/processes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Process
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {processes.map((process) => (
                        <Card key={process.id}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Workflow className="h-5 w-5" />
                                    {process.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{process.project.name}</Badge>
                                    <Badge variant="outline">
                                        {getStepCount(process.visualization_data)} steps
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/processes/${process.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/processes/${process.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(process)}
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {processes.length === 0 && (
                    <div className="text-center py-12">
                        <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No processes found</p>
                        <Button asChild>
                            <Link href="/processes/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first process
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}