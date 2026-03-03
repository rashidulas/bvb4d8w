'use client';

import { useState } from 'react';
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
import { LoggedExerciseInput, WorkoutLogData, SetData } from '@/lib/actions/workoutLogs';
import { ExerciseData } from '@/lib/actions/exercises';
import { Trash2, ChevronUp, ChevronDown, Plus, Save, Loader2 } from 'lucide-react';

interface WorkoutTableProps {
    template: WorkoutTemplateData;
    exercises: ExerciseData[];
    loggedExercises: LoggedExerciseInput[];
    onLoggedExercisesChange: (updated: LoggedExerciseInput[]) => void;
    previousWeekLog?: WorkoutLogData | null;
    isEditMode?: boolean;
    onTemplateChange?: (updated: TemplateExerciseData[]) => void;
    onSaveExercise?: (exerciseIndex: number) => void;
    isSaving?: boolean;
}

export function WorkoutTable({
    template,
    exercises,
    loggedExercises,
    onLoggedExercisesChange,
    previousWeekLog,
    isEditMode = false,
    onTemplateChange,
    onSaveExercise,
    isSaving = false,
}: WorkoutTableProps) {
    // Collapsible state - track which exercises have their sets expanded (start collapsed)
    const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());

    const toggleExercise = (index: number) => {
        const newExpanded = new Set(expandedExercises);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedExercises(newExpanded);
    };

    const parseNumber = (val: string): number | null => {
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    };

    // Update a specific set within a logged exercise
    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetData, value: number | null) => {
        const updated = [...loggedExercises];
        const exercise = { ...updated[exerciseIndex] };
        const sets = [...exercise.sets];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        exercise.sets = sets;
        updated[exerciseIndex] = exercise;
        onLoggedExercisesChange(updated);
    };

    // Get previous week data for a specific exercise
    const getPreviousWeekData = (exerciseId: string) => {
        if (!previousWeekLog) return null;
        return previousWeekLog.loggedExercises.find((ex) => ex.exerciseId === exerciseId);
    };

    // Template editing functions
    const updateTemplateExercise = (
        index: number,
        field: keyof TemplateExerciseData,
        value: string | number | null
    ) => {
        if (!onTemplateChange) return;
        const updated = [...template.exercises];
        
        // If changing sets count, adjust logged exercises too
        if (field === 'sets' && typeof value === 'number') {
            const oldSets = updated[index].sets;
            updated[index] = { ...updated[index], [field]: value };
            
            // Adjust logged exercise sets
            const loggedUpdated = [...loggedExercises];
            if (loggedUpdated[index]) {
                const currentSets = loggedUpdated[index].sets;
                if (value > oldSets) {
                    // Add empty sets
                    loggedUpdated[index].sets = [
                        ...currentSets,
                        ...Array.from({ length: value - oldSets }, () => ({ load: null, reps: null, rpe: null }))
                    ];
                } else if (value < oldSets) {
                    // Remove excess sets
                    loggedUpdated[index].sets = currentSets.slice(0, value);
                }
                onLoggedExercisesChange(loggedUpdated);
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        
        onTemplateChange(updated);
    };

    const handleExerciseSwap = (index: number, newExerciseId: string) => {
        const newExercise = exercises.find((e) => e._id === newExerciseId);
        if (!newExercise) return;
        
        if (isEditMode) {
            // Update all exercise properties at once to avoid multiple re-renders
            if (!onTemplateChange) return;
            const updated = [...template.exercises];
            updated[index] = {
                ...updated[index],
                exerciseId: newExerciseId,
                exerciseName: newExercise.name,
                exerciseCategory: newExercise.category,
            };
            onTemplateChange(updated);
        } else {
            const updated = [...loggedExercises];
            updated[index] = {
                ...updated[index],
                exerciseId: newExerciseId,
                exerciseName: newExercise.name,
            };
            onLoggedExercisesChange(updated);
        }
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
        <div className="space-y-4">
            {/* Previous Week Summary */}
            {!isEditMode && previousWeekLog && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-sm font-medium text-primary mb-1">📊 Previous Week (Week {previousWeekLog.week})</p>
                    <p className="text-xs text-muted-foreground">Previous week's data shown in input placeholders</p>
                </div>
            )}

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

            {/* Exercises */}
            <div className="space-y-4">
                {template.exercises.map((templateEx, exerciseIndex) => {
                    const logged = loggedExercises[exerciseIndex];
                    if (!logged && !isEditMode) return null;

                    const prevWeekExercise = previousWeekLog ? getPreviousWeekData(templateEx.exerciseId) : null;

                    return (
                        <div
                            key={`${templateEx.exerciseId}-${exerciseIndex}`}
                            className="rounded-xl border border-border bg-card p-4 space-y-3"
                        >
                            {/* Exercise Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">#{exerciseIndex + 1}</Badge>
                                        
                                        {/* Collapse/Expand Button */}
                                        {!isEditMode && (
                                            <Button
                                                onClick={() => toggleExercise(exerciseIndex)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                            >
                                                {expandedExercises.has(exerciseIndex) ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                        
                                        <Select
                                            value={templateEx.exerciseId}
                                            onValueChange={(val) => handleExerciseSwap(exerciseIndex, val)}
                                            disabled={!isEditMode}
                                        >
                                            <SelectTrigger className="h-9 font-semibold border-none shadow-none p-0 hover:bg-muted/50">
                                                <SelectValue placeholder={templateEx.exerciseName}>
                                                    {templateEx.exerciseName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exercises.map((ex) => (
                                                    <SelectItem key={ex._id} value={ex._id}>
                                                        {ex.name} <span className="text-xs text-muted-foreground">({ex.category})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {/* Per-Exercise Save Button */}
                                        {!isEditMode && onSaveExercise && expandedExercises.has(exerciseIndex) && (
                                            <Button
                                                onClick={() => onSaveExercise(exerciseIndex)}
                                                disabled={isSaving}
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1.5 ml-auto"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Save className="h-3 w-3" />
                                                )}
                                                <span className="text-xs">Save</span>
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Sets:</span>
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="h-7 w-16 text-center"
                                                    value={templateEx.sets}
                                                    onChange={(e) => updateTemplateExercise(exerciseIndex, 'sets', parseInt(e.target.value) || 1)}
                                                />
                                            ) : (
                                                <span className="font-semibold">{templateEx.sets}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Reps:</span>
                                            {isEditMode ? (
                                                <Input
                                                    type="text"
                                                    className="h-7 w-20 text-center"
                                                    value={templateEx.reps}
                                                    onChange={(e) => updateTemplateExercise(exerciseIndex, 'reps', e.target.value)}
                                                />
                                            ) : (
                                                <span className="font-semibold">{templateEx.reps}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">RPE:</span>
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="5"
                                                    max="10"
                                                    className="h-7 w-16 text-center"
                                                    value={templateEx.targetRpe ?? ''}
                                                    onChange={(e) => updateTemplateExercise(exerciseIndex, 'targetRpe', parseNumber(e.target.value))}
                                                />
                                            ) : (
                                                <span className="font-semibold">{templateEx.targetRpe ? `@${templateEx.targetRpe}` : '—'}</span>
                                            )}
                                        </div>
                                    </div>
                                    {templateEx.notes && (
                                        <p className="text-xs text-muted-foreground italic">{templateEx.notes}</p>
                                    )}
                                    {isEditMode && (
                                        <Input
                                            type="text"
                                            className="h-8 text-sm"
                                            placeholder="Add notes..."
                                            value={templateEx.notes}
                                            onChange={(e) => updateTemplateExercise(exerciseIndex, 'notes', e.target.value)}
                                        />
                                    )}
                                </div>
                                {isEditMode && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            onClick={() => moveExercise(exerciseIndex, 'up')}
                                            disabled={exerciseIndex === 0}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => moveExercise(exerciseIndex, 'down')}
                                            disabled={exerciseIndex === template.exercises.length - 1}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => removeExercise(exerciseIndex)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Sets Table (Logging Mode) - Collapsible */}
                            {!isEditMode && logged && expandedExercises.has(exerciseIndex) ? (
                                logged.sets && logged.sets.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                                            <span className="text-center">Set</span>
                                            <span className="text-center text-primary">Load (lb)</span>
                                            <span className="text-center text-primary">Reps</span>
                                            <span className="text-center text-primary">RPE</span>
                                        </div>
                                        {logged.sets.map((set, setIndex) => {
                                            const prevSet = prevWeekExercise?.sets[setIndex];
                                            return (
                                            <div key={setIndex} className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 items-center">
                                                <div className="flex items-center justify-center">
                                                    <Badge variant="outline" className="text-xs">{setIndex + 1}</Badge>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step="2.5"
                                                    min="0"
                                                    placeholder={prevSet?.load ? `${prevSet.load}` : 'lb'}
                                                    title={prevSet?.load ? `Last week: ${prevSet.load} lb` : undefined}
                                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                                    value={set.load ?? ''}
                                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'load', parseNumber(e.target.value))}
                                                />
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    placeholder={prevSet?.reps ? `${prevSet.reps}` : 'reps'}
                                                    title={prevSet?.reps ? `Last week: ${prevSet.reps} reps` : undefined}
                                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                                    value={set.reps ?? ''}
                                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseNumber(e.target.value))}
                                                />
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="5"
                                                    max="10"
                                                    placeholder={prevSet?.rpe ? `${prevSet.rpe}` : 'RPE'}
                                                    title={prevSet?.rpe ? `Last week: @${prevSet.rpe}` : undefined}
                                                    className="h-9 text-center text-sm border-primary/30 focus:border-primary bg-primary/5"
                                                    value={set.rpe ?? ''}
                                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', parseNumber(e.target.value))}
                                                />
                                            </div>
                                        );
                                    })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                        No sets data available. Please reload the page.
                                    </div>
                                )
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
