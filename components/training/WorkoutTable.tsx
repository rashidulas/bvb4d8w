'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { WorkoutTemplateData } from '@/lib/actions/programTemplates';
import { LoggedExerciseInput } from '@/lib/actions/workoutLogs';
import { ExerciseData } from '@/lib/actions/exercises';

interface WorkoutTableProps {
    template: WorkoutTemplateData;
    exercises: ExerciseData[];
    loggedExercises: LoggedExerciseInput[];
    onLoggedExercisesChange: (updated: LoggedExerciseInput[]) => void;
}

export function WorkoutTable({
    template,
    exercises,
    loggedExercises,
    onLoggedExercisesChange,
}: WorkoutTableProps) {
    const updateLoggedExercise = (
        index: number,
        field: keyof LoggedExerciseInput,
        value: string | number | null
    ) => {
        const updated = [...loggedExercises];
        updated[index] = { ...updated[index], [field]: value };
        onLoggedExercisesChange(updated);
    };

    const handleExerciseSwap = (index: number, newExerciseId: string) => {
        const newExercise = exercises.find((e) => e._id === newExerciseId);
        const updated = [...loggedExercises];
        updated[index] = {
            ...updated[index],
            exerciseId: newExerciseId,
            exerciseName: newExercise?.name ?? '',
        };
        onLoggedExercisesChange(updated);
    };

    const parseNumber = (val: string): number | null => {
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    };

    return (
        <div className="space-y-3">
            {/* Column headers */}
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Exercise</span>
                <span className="text-center">Sets</span>
                <span className="text-center">Reps</span>
                <span className="text-center">RPE</span>
                <span className="text-center text-primary">Load (kg)</span>
                <span className="text-center text-primary">Actual Reps</span>
                <span className="text-center text-primary">Actual RPE</span>
            </div>

            {template.exercises.map((templateEx, index) => {
                const logged = loggedExercises[index];
                if (!logged) return null;

                return (
                    <div
                        key={`${templateEx.exerciseId}-${index}`}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                        {/* Mobile label */}
                        <div className="md:hidden px-4 pt-3 pb-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Exercise {index + 1}</Badge>
                            {templateEx.notes && (
                                <span className="text-xs text-muted-foreground truncate">{templateEx.notes}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 p-3 md:p-4 items-center">
                            {/* Exercise name / dropdown */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Exercise</label>
                                <Select
                                    value={logged.exerciseId}
                                    onValueChange={(val) => handleExerciseSwap(index, val)}
                                >
                                    <SelectTrigger className="h-9 text-sm font-medium border-border focus:ring-primary">
                                        <SelectValue placeholder="Select exercise" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exercises.map((ex) => (
                                            <SelectItem key={ex._id} value={ex._id}>
                                                {ex.name}
                                                <span className="ml-2 text-xs text-muted-foreground">({ex.category})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {templateEx.notes && (
                                    <p className="text-xs text-muted-foreground hidden md:block px-1">{templateEx.notes}</p>
                                )}
                            </div>

                            {/* ASSIGNED — Sets */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Sets</label>
                                <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                    <span className="text-sm font-semibold text-foreground">{templateEx.sets}</span>
                                </div>
                            </div>

                            {/* ASSIGNED — Reps */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Reps</label>
                                <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                    <span className="text-sm font-semibold text-foreground">{templateEx.reps}</span>
                                </div>
                            </div>

                            {/* ASSIGNED — RPE */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Target RPE</label>
                                <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        {templateEx.targetRpe != null ? `@${templateEx.targetRpe}` : '—'}
                                    </span>
                                </div>
                            </div>

                            {/* ACTUAL — Load */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-primary font-medium">Load (kg)</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    placeholder="kg"
                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                    value={logged.actualLoad ?? ''}
                                    onChange={(e) =>
                                        updateLoggedExercise(index, 'actualLoad', parseNumber(e.target.value))
                                    }
                                    tabIndex={index * 3 + 1}
                                />
                            </div>

                            {/* ACTUAL — Reps */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-primary font-medium">Actual Reps</label>
                                <Input
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="reps"
                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                    value={logged.actualReps ?? ''}
                                    onChange={(e) =>
                                        updateLoggedExercise(index, 'actualReps', parseNumber(e.target.value))
                                    }
                                    tabIndex={index * 3 + 2}
                                />
                            </div>

                            {/* ACTUAL — RPE */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-primary font-medium">Actual RPE</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="5"
                                    max="10"
                                    placeholder="RPE"
                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                    value={logged.actualRpe ?? ''}
                                    onChange={(e) =>
                                        updateLoggedExercise(index, 'actualRpe', parseNumber(e.target.value))
                                    }
                                    tabIndex={index * 3 + 3}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
