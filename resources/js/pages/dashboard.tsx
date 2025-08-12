import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        try {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Business Process Visualization Generator</h1>
                    <p className="text-muted-foreground">
                        Describe your business process and AI will generate a visualization for you
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="text-sm font-medium">
                            Describe your business process:
                        </label>
                        <Input
                            id="prompt"
                            type="text"
                            placeholder="e.g., Customer order processing workflow with inventory check..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full"
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !prompt.trim()}>
                        {isLoading ? 'Generating...' : 'Generate Visualization'}
                    </Button>
                </form>

                {response && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Generated Visualization:</h3>
                        <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-muted/30">
                            <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                        </div>
                    </div>
                )}

                {!response && (
                    <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-muted-foreground">Your visualization will appear here</p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
