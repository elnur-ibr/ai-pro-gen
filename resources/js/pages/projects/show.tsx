import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Projects',
        href: '/projects',
    },
    {
        title: 'Project Details',
        href: '#',
    },
];

export default function ShowProject({ project }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
            router.delete(`/projects/${project.id}`);
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
            <Head title={`Project: ${project.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/projects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">{project.name}</h1>
                        <p className="text-muted-foreground">
                            Project details and information
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/projects/${project.id}/edit`}>
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

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                            <p className="text-lg">{project.name}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                            <p>{formatDate(project.created_at)}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                            <p>{formatDate(project.updated_at)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}