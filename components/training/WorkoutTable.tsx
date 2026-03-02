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
import { Button } from '@/components/ui/button';
import { WorkoutTemplateData, TemplateExerciseData } from '@/lib/actions/programTemplates';
import { LoggedExerciseInput } from '@/lib/actions/workoutLogs';
import { ExerciseData } from '@/lib/actions/exercises';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';

interface WorkoutTableProps {
    template: WorkoutTemplateData;
    exercises: ExerciseData[];
    loggedExercises: LoggedExerciseInput[];
    onLoggedExercisesChange: (updated: LoggedExerciseInput[]) => void;
    isEditMode?: boolean;
    onTemplateChange?: (updated: TemplateExerciseData[]) => void;
}

export function WorkoutTable({
    template,
    exercises,
    loggedExercises,
    onLoggedExercisesChange,
    isEditMode = false,
    onTemplateChange,
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

    // Template editing functions
    const updateTemplateExercise = (
        index: number,
        field: keyof TemplateExerciseData,
        value: string | number | null
    ) => {
        if (!onTemplateChange) return;
        const updated = [...template.exercises];
        updated[index] = { ...updated[index], [field]: value };
        onTemplateChange(updated);
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        if (!onTemplateChange) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= template.exercises.length) return;

        const updated = [...template.exercises];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onTemplateChange(updated);
    };

    const removeExercise = (index: number) => {
        if (!onTemplateChange) return;
        const updated = template.exercises.filter((_, i) => i !== index);
        onTemplateChange(updated);
    };

    const addExercise = () => {
        if (!onTemplateChange || exercises.length === 0) return;
        const firstExercise = exercises[0];
        const newExercise: TemplateExerciseData = {
            exerciseId: firstExercise._id,
            exerciseName: firstExercise.name,
            exerciseCategory: firstExercise.category,
            sets: 3,
            reps: '5',
            targetRpe: 8,
            notes: '',
            order: template.exercises.length,
        };
        onTemplateChange([...template.exercises, newExercise]);
    };

    return (
        <div className="space-y-3">
            {/* Add Exercise Button (Edit Mode) */}
            {isEditMode && (
                <div className="flex justify-end">
                    <Button
                        onClick={addExercise}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Exercise
                    </Button>
                </div>
            )}

            {/* Column headers */}
            <div className={`hidden md:grid gap-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                isEditMode 
                    ? 'md:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto]' 
                    : 'md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr]'
            }`}>
                <span>Exercise</span>
                <span className="text-center">Sets</span>
                <span className="text-center">Reps</span>
                <span className="text-center">RPE</span>
                {isEditMode ? (
                    <>
                        <span className="text-center">Notes</span>
                        <span className="text-center">Actions</span>
                    </>
                ) : (
                    <>
                        <span className="text-center text-primary">Load (kg)</span>
                        <span className="text-center text-primary">Actual Reps</span>
                        <span className="text-center text-primary">Actual RPE</span>
                    </>
                )}
            </div>

            {template.exercises.map((templateEx, index) => {
                const logged = loggedExercises[index];
                if (!logged && !isEditMode) return null;

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

                        <div className={`grid grid-cols-1 gap-2 p-3 md:p-4 items-center ${
                            isEditMode 
                                ? 'md:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto]' 
                                : 'md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr]'
                        }`}>
                            {/* Exercise name / dropdown */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Exercise</label>
                                <Select
                                    value={isEditMode ? templateEx.exerciseId : logged?.exerciseId}
                                    onValueChange={(val) => {
                                        if (isEditMode) {
                                            const ex = exercises.find((e) => e._id === val);
                                            updateTemplateExercise(index, 'exerciseId', val);
                                            if (ex) {
                                                updateTemplateExercise(index, 'exerciseName', ex.name);
                                                updateTemplateExercise(index, 'exerciseCategory', ex.category);
                                            }
                                        } else {
                                            handleExerciseSwap(index, val);
                                        }
                                    }}
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
                                {templateEx.notes && !isEditMode && (
                                    <p className="text-xs text-muted-foreground hidden md:block px-1">{templateEx.notes}</p>
                                )}
                            </div>

                            {/* Sets */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Sets</label>
                                {isEditMode ? (
                                    <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        className="h-9 text-center text-sm"
                                        value={templateEx.sets}
                                        onChange={(e) => updateTemplateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                        <span className="text-sm font-semibold text-foreground">{templateEx.sets}</span>
                                    </div>
                                )}
                            </div>

                            {/* Reps */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">Reps</label>
                                {isEditMode ? (
                                    <Input
                                        type="text"
                                        className="h-9 text-center text-sm"
                                        placeholder="e.g. 5 or 8-10"
                                        value={templateEx.reps}
                                        onChange={(e) => updateTemplateExercise(index, 'reps', e.target.value)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                        <span className="text-sm font-semibold text-foreground">{templateEx.reps}</span>
                                    </div>
                                )}
                            </div>

                            {/* RPE */}
                            <div className="space-y-1">
                                <label className="md:hidden text-xs text-muted-foreground font-medium">
                                    {isEditMode ? 'Target RPE' : 'Target RPE'}
                                </label>
                                {isEditMode ? (
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="5"
                                        max="10"
                                        className="h-9 text-center text-sm"
                                        placeholder="RPE"
                                        value={templateEx.targetRpe ?? ''}
                                        onChange={(e) => updateTemplateExercise(index, 'targetRpe', parseNumber(e.target.value))}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-9 rounded-md bg-muted/50 border border-border/50 px-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            {templateEx.targetRpe != null ? `@${templateEx.targetRpe}` : '—'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {isEditMode ? (
                                <>
                                    {/* Notes (Edit Mode) */}
                                    <div className="space-y-1">
                                        <label className="md:hidden text-xs text-muted-foreground font-medium">Notes</label>
                                        <Input
                                            type="text"
                                            className="h-9 text-sm"
                                            placeholder="Optional notes"
                                            value={templateEx.notes}
                                            onChange={(e) => updateTemplateExercise(index, 'notes', e.target.value)}
                                        />
                                    </div>

                                    {/* Actions (Edit Mode) */}
                                    <div className="flex items-center gap-1 justify-center">
                                        <Button
                                            onClick={() => moveExercise(index, 'up')}
                                            disabled={index === 0}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => moveExercise(index, 'down')}
                                            disabled={index === template.exercises.length - 1}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => removeExercise(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* ACTUAL — Load */}
                                    <div className="space-y-1">
                                        <label className="md:hidden text-xs text-primary font-medium">Load (kg)</label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="kg"
                                            className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                            value={logged?.actualLoad ?? ''}
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
                                            value={logged?.actualReps ?? ''}
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
                                            value={logged?.actualRpe ?? ''}
                                            onChange={(e) =>
                                                updateLoggedExercise(index, 'actualRpe', parseNumber(e.target.value))
                                            }
                                            tabIndex={index * 3 + 3}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
