import { getExercises } from '@/lib/actions/exercises';
import { ExerciseTable } from '@/components/exercises/ExerciseTable';
import { AddExerciseButton } from '@/components/exercises/AddExerciseButton';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Exercise Database — PowerTrack',
    description: 'Manage your exercise library for your powerlifting program.',
};

export default async function ExercisesPage() {
    let exercises: Awaited<ReturnType<typeof getExercises>> = [];
    let hasError = false;
    let errorMessage = '';

    try {
        exercises = await getExercises();
    } catch (err) {
        hasError = true;
        errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ExercisesPage] Failed to load exercises:', err);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Exercise Database</h1>
                    </div>
                    {hasError ? (
                        <p className="text-red-500 text-sm">
                            ⚠️ Database connection error: {errorMessage}
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} — source of truth for training day dropdowns.
                        </p>
                    )}
                </div>
                <AddExerciseButton />
            </div>

            {/* Table */}
            <ExerciseTable exercises={exercises} />
        </div>
    );
}
