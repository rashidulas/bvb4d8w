'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Dumbbell } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseFormDialog } from './ExerciseFormDialog';
import { deleteExercise, ExerciseData } from '@/lib/actions/exercises';

const categoryColors: Record<string, string> = {
    Squat: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/20',
    Bench: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/20',
    Deadlift: 'bg-red-500/15 text-red-400 hover:bg-red-500/20',
    Push: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/20',
    Pull: 'bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/20',
    Leg: 'bg-green-500/15 text-green-400 hover:bg-green-500/20',
    Core: 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/20',
    Accessory: 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/20',
};

interface ExerciseTableProps {
    exercises: ExerciseData[];
}

export function ExerciseTable({ exercises: initialExercises }: ExerciseTableProps) {
    const [exercises, setExercises] = useState(initialExercises);
    const [editingExercise, setEditingExercise] = useState<ExerciseData | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        startTransition(async () => {
            const result = await deleteExercise(id);
            if (result.success) {
                setExercises((prev) => prev.filter((e) => e._id !== id));
                toast.success(`"${name}" deleted`);
            } else {
                toast.error(result.error ?? 'Failed to delete exercise');
            }
        });
    };

    const handleSaved = (updated: ExerciseData) => {
        setExercises((prev) =>
            prev.some((e) => e._id === updated._id)
                ? prev.map((e) => (e._id === updated._id ? updated : e))
                : [...prev, updated]
        );
    };

    if (exercises.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-transparent py-16 text-center">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No exercises yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                    Add your first exercise or run the seed script to populate from your program.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="font-semibold text-foreground">Exercise</TableHead>
                            <TableHead className="font-semibold text-foreground">Category</TableHead>
                            <TableHead className="font-semibold text-foreground hidden sm:table-cell">Added</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {exercises.map((exercise) => (
                            <TableRow key={exercise._id} className="border-border hover:bg-accent/50">
                                <TableCell className="font-medium">{exercise.name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={categoryColors[exercise.category] ?? 'bg-muted text-muted-foreground'}
                                    >
                                        {exercise.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                                    {new Date(exercise.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingExercise(exercise)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(exercise._id, exercise.name)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            {editingExercise && (
                <ExerciseFormDialog
                    open={!!editingExercise}
                    onOpenChange={(open: boolean) => { if (!open) setEditingExercise(null); }}
                    exercise={editingExercise}
                    onSaved={handleSaved}
                />
            )}
        </>
    );
}
