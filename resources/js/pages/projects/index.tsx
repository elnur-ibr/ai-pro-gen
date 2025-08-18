import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    projects: Project[];
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
];

export default function ProjectsIndex({ projects }: Props) {
    const handleDelete = (project: Project) => {
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
            router.delete(`/projects/${project.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your projects
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/projects/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/projects/${project.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/projects/${project.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(project)}
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No projects found</p>
                        <Button asChild>
                            <Link href="/projects/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first project
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}