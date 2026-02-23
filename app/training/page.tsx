'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ChevronDown, Dumbbell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WorkoutTable } from '@/components/training/WorkoutTable';
import { getWorkoutTemplate, WorkoutTemplateData } from '@/lib/actions/programTemplates';
import { getWorkoutLog, saveWorkoutLog, LoggedExerciseInput } from '@/lib/actions/workoutLogs';
import { getExercises, ExerciseData } from '@/lib/actions/exercises';


const DAY_LABELS = ['', 'Squat Day', 'Bench Day', 'Deadlift Day', 'Upper Accessory'];

export default function TrainingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [week, setWeek] = useState<number>(Number(searchParams.get('week')) || 1);
    const [day, setDay] = useState<number>(Number(searchParams.get('day')) || 1);

    const [template, setTemplate] = useState<WorkoutTemplateData | null>(null);
    const [exercises, setExercises] = useState<ExerciseData[]>([]);
    const [loggedExercises, setLoggedExercises] = useState<LoggedExerciseInput[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, startSaving] = useTransition();

    // Load template + existing log whenever week/day changes
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [tmpl, log, exList] = await Promise.all([
                    getWorkoutTemplate(week, day),
                    getWorkoutLog(week, day),
                    getExercises(),
                ]);

                setTemplate(tmpl);
                setExercises(exList);

                if (log) {
                    setLoggedExercises(log.loggedExercises);
                } else if (tmpl) {
                    // Pre-populate with blanks from template
                    setLoggedExercises(
                        tmpl.exercises.map((ex) => ({
                            exerciseId: ex.exerciseId,
                            exerciseName: ex.exerciseName,
                            actualLoad: null,
                            actualReps: null,
                            actualRpe: null,
                            notes: '',
                            order: ex.order,
                        }))
                    );
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
                        Select a week and day to load your program, enter what you actually lifted, then save.
                    </p>
                </div>
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
            </div>

            {/* Week / Day selectors */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Week</label>
                    <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
                        <SelectTrigger className="w-28" id="week-select">
                            <SelectValue />
                            <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
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
                            <SelectValue />
                            <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
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
