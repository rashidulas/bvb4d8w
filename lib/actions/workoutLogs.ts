'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import WorkoutLog from '@/models/WorkoutLog';

export interface LoggedExerciseInput {
    exerciseId: string;
    exerciseName: string;
    actualLoad: number | null;
    actualReps: number | null;
    actualRpe: number | null;
    notes: string;
    order: number;
}

export interface SaveWorkoutLogInput {
    week: number;
    day: number;
    date: string; // ISO date string
    loggedExercises: LoggedExerciseInput[];
    completed?: boolean;
}

export interface WorkoutLogData {
    _id: string;
    date: string;
    week: number;
    day: number;
    completed: boolean;
    loggedExercises: LoggedExerciseInput[];
}

export async function saveWorkoutLog(
    input: SaveWorkoutLogInput
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();

        const date = new Date(input.date);

        // Upsert: update if a log exists for this exact week/day/date, otherwise insert
        await WorkoutLog.findOneAndUpdate(
            { week: input.week, day: input.day, date },
            {
                week: input.week,
                day: input.day,
                date,
                completed: input.completed ?? true,
                loggedExercises: input.loggedExercises.map((ex, i) => ({
                    exerciseId: ex.exerciseId,
                    exerciseName: ex.exerciseName,
                    actualLoad: ex.actualLoad,
                    actualReps: ex.actualReps,
                    actualRpe: ex.actualRpe,
                    notes: ex.notes,
                    order: ex.order ?? i,
                })),
            },
            { upsert: true, new: true, runValidators: true }
        );

        revalidatePath('/training');
        return { success: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

export async function getWorkoutLog(
    week: number,
    day: number
): Promise<WorkoutLogData | null> {
    await dbConnect();

    const log = await WorkoutLog.findOne({ week, day })
        .sort({ date: -1 })
        .lean();

    if (!log) return null;

    return {
        _id: log._id.toString(),
        date: (log.date as Date).toISOString(),
        week: log.week,
        day: log.day,
        completed: log.completed,
        loggedExercises: (log.loggedExercises || []).map((ex: {
            exerciseId: { toString: () => string };
            exerciseName?: string;
            actualLoad?: number | null;
            actualReps?: number | null;
            actualRpe?: number | null;
            notes?: string;
            order?: number;
        }, i: number) => ({
            exerciseId: ex.exerciseId.toString(),
            exerciseName: ex.exerciseName ?? '',
            actualLoad: ex.actualLoad ?? null,
            actualReps: ex.actualReps ?? null,
            actualRpe: ex.actualRpe ?? null,
            notes: ex.notes ?? '',
            order: ex.order ?? i,
        })),
    };
}

export async function getRecentLogs(limit = 10): Promise<WorkoutLogData[]> {
    await dbConnect();

    const logs = await WorkoutLog.find({ completed: true })
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    return logs.map((log) => ({
        _id: log._id.toString(),
        date: (log.date as Date).toISOString(),
        week: log.week,
        day: log.day,
        completed: log.completed,
        loggedExercises: [],
    }));
}
