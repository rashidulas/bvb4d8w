'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ChevronDown, Dumbbell, Loader2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WorkoutTable } from '@/components/training/WorkoutTable';
import { getWorkoutTemplate, WorkoutTemplateData, updateWorkoutTemplate, TemplateExerciseData } from '@/lib/actions/programTemplates';
import { getWorkoutLog, getPreviousWeekLog, saveWorkoutLog, LoggedExerciseInput, WorkoutLogData } from '@/lib/actions/workoutLogs';
import { getExercises, ExerciseData } from '@/lib/actions/exercises';


const DAY_LABELS = ['', 'Squat Day', 'Bench Day', 'Deadlift Day', 'Upper Accessory'];

function TrainingPageInner() {

    const searchParams = useSearchParams();
    const router = useRouter();

    const [week, setWeek] = useState<number>(Number(searchParams.get('week')) || 1);
    const [day, setDay] = useState<number>(Number(searchParams.get('day')) || 1);

    const [template, setTemplate] = useState<WorkoutTemplateData | null>(null);
    const [exercises, setExercises] = useState<ExerciseData[]>([]);
    const [loggedExercises, setLoggedExercises] = useState<LoggedExerciseInput[]>([]);
    const [previousWeekLog, setPreviousWeekLog] = useState<WorkoutLogData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, startSaving] = useTransition();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingTemplate, startSavingTemplate] = useTransition();

    // Load template + existing log whenever week/day changes
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [tmpl, log, prevLog, exList] = await Promise.all([
                    getWorkoutTemplate(week, day),
                    getWorkoutLog(week, day),
                    getPreviousWeekLog(week, day),
                    getExercises(),
                ]);

                setTemplate(tmpl);
                setExercises(exList);
                setPreviousWeekLog(prevLog);

                if (log) {
                    // Migrate old logs that don't have sets structure
                    const migratedLog = log.loggedExercises.map((ex, i) => {
                        if (!ex.sets || ex.sets.length === 0) {
                            // Old format, create sets from template
                            const templateEx = tmpl?.exercises[i];
                            const setCount = templateEx?.sets || 3;
                            return {
                                ...ex,
                                sets: Array.from({ length: setCount }, () => ({
                                    load: null,
                                    reps: null,
                                    rpe: null,
                                })),
                            };
                        }
                        return ex;
                    });
                    setLoggedExercises(migratedLog);
                } else if (tmpl) {
                    // Pre-populate with empty sets based on template
                    const initialized = tmpl.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        exerciseName: ex.exerciseName,
                        sets: Array.from({ length: ex.sets }, () => ({
                            load: null,
                            reps: null,
                            rpe: null,
                        })),
                        notes: '',
                        order: ex.order,
                    }));
                    setLoggedExercises(initialized);
                } else {
                    setLoggedExercises([]);
                }
            } catch {
                toast.error('Failed to load workout. Check your MongoDB connection.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
        // Update URL params
        router.replace(`/training?week=${week}&day=${day}`, { scroll: false });
    }, [week, day]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleSave = () => {
        startSaving(async () => {
            const result = await saveWorkoutLog({
                week,
                day,
                date: new Date().toISOString(),
                loggedExercises,
                completed: true,
            });
            if (result.success) {
                toast.success('Workout saved! 💪');
            } else {
                toast.error(result.error ?? 'Failed to save workout');
            }
        });
    };

    const handleSaveExercise = (exerciseIndex: number) => {
        startSaving(async () => {
            const result = await saveWorkoutLog({
                week,
                day,
                date: new Date().toISOString(),
                loggedExercises,
                completed: false,
            });
            if (result.success) {
                toast.success(`${loggedExercises[exerciseIndex].exerciseName} saved! ✓`);
            } else {
                toast.error(result.error ?? 'Failed to save');
            }
        });
    };

    const handleSaveTemplate = () => {
        if (!template) return;

        startSavingTemplate(async () => {
            const result = await updateWorkoutTemplate(week, day, template.exercises);
            if (result.success) {
                toast.success('Template updated!');
                setIsEditMode(false);
                // Sync logged exercises with template
                setLoggedExercises(
                    template.exercises.map((ex) => {
                        const existing = loggedExercises.find((l) => l.exerciseId === ex.exerciseId);
                        return existing || {
                            exerciseId: ex.exerciseId,
                            exerciseName: ex.exerciseName,
                            sets: Array.from({ length: ex.sets }, () => ({
                                load: null,
                                reps: null,
                                rpe: null,
                            })),
                            notes: '',
                            order: ex.order,
                        };
                    })
                );
            } else {
                toast.error(result.error ?? 'Failed to update template');
            }
        });
    };

    const handleTemplateChange = (updatedExercises: TemplateExerciseData[]) => {
        if (!template) return;
        setTemplate({
            ...template,
            exercises: updatedExercises,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Training Log</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {isEditMode 
                            ? 'Edit your workout template: add, remove, or reorder exercises.' 
                            : 'Select a week and day to load your program, enter what you actually lifted, then save.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isEditMode ? (
                        <>
                            <Button
                                onClick={() => setIsEditMode(false)}
                                variant="outline"
                                disabled={isSavingTemplate}
                                className="gap-2"
                                size="lg"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveTemplate}
                                disabled={isSavingTemplate || !template}
                                className="gap-2"
                                size="lg"
                            >
                                {isSavingTemplate ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isSavingTemplate ? 'Saving…' : 'Save Template'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => setIsEditMode(true)}
                                variant="outline"
                                disabled={isLoading || !template}
                                className="gap-2"
                                size="lg"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Template
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || isLoading || loggedExercises.length === 0}
                                className="gap-2 shrink-0"
                                size="lg"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isSaving ? 'Saving…' : 'Save Workout'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Week / Day selectors */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Week</label>
                    <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
                        <SelectTrigger className="w-28" id="week-select">
                            <SelectValue placeholder="Week">{`Week ${week}`}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => (
                                <SelectItem key={w} value={String(w)}>
                                    Week {w}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Day</label>
                    <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
                        <SelectTrigger className="w-44" id="day-select">
                            <SelectValue placeholder="Day">{`Day ${day} — ${DAY_LABELS[day]}`}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4].map((d) => (
                                <SelectItem key={d} value={String(d)}>
                                    Day {d} — {DAY_LABELS[d]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {template && (
                    <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">
                            {template.label || `Week ${week}, Day ${day}`}
                            {' · '}
                            <span className="text-primary font-medium">{template.exercises.length} exercises</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Workout Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading workout…
                </div>
            ) : template ? (
                <WorkoutTable
                    template={template}
                    exercises={exercises}
                    loggedExercises={loggedExercises}
                    onLoggedExercisesChange={setLoggedExercises}
                    previousWeekLog={previousWeekLog}
                    isEditMode={isEditMode}
                    onTemplateChange={handleTemplateChange}
                    onSaveExercise={!isEditMode ? handleSaveExercise : undefined}
                    isSaving={isSaving}
                />
            ) : (
                <div className="rounded-xl border border-dashed border-border py-16 text-center">
                    <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No program template found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                        Run the seed script to populate your 8-week program, then reload.
                    </p>
                </div>
            )}

            {/* Save button (bottom) */}
            {!isLoading && loggedExercises.length > 0 && (
                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2"
                        size="lg"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving…' : 'Save Workout'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function TrainingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                Loading training log…
            </div>
        }>
            <TrainingPageInner />
        </Suspense>
    );
}
