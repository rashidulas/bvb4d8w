'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Exercise, { IExercise, ExerciseCategory } from '@/models/Exercise';

export interface ExerciseData {
    _id: string;
    name: string;
    category: ExerciseCategory;
    createdAt: string;
    updatedAt: string;
}

function serialize(doc: IExercise): ExerciseData {
    return {
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export async function getExercises(): Promise<ExerciseData[]> {
    try {
        await dbConnect();
        const exercises = await Exercise.find().sort({ category: 1, name: 1 }).lean();
        return exercises.map((e) => ({
            _id: e._id.toString(),
            name: e.name as string,
            category: e.category as ExerciseCategory,
            createdAt: (e.createdAt as Date).toISOString(),
            updatedAt: (e.updatedAt as Date).toISOString(),
        }));
    } catch (err: unknown) {
        console.error('[getExercises] Error:', err);
        throw err;
    }
}

export async function createExercise(data: {
    name: string;
    category: ExerciseCategory;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const exercise = new Exercise({ name: data.name, category: data.category });
        await exercise.save();
        revalidatePath('/exercises');
        revalidatePath('/training');
        return { success: true };
    } catch (err: unknown) {
        console.error('[createExercise] Error:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

export async function updateExercise(
    id: string,
    data: { name: string; category: ExerciseCategory }
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        await Exercise.findByIdAndUpdate(id, data, { runValidators: true });
        revalidatePath('/exercises');
        revalidatePath('/training');
        return { success: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

export async function deleteExercise(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        await Exercise.findByIdAndDelete(id);
        revalidatePath('/exercises');
        return { success: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg };
    }
}
