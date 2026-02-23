'use server';

import dbConnect from '@/lib/mongodb';
import ProgramTemplate from '@/models/ProgramTemplate';

export interface TemplateExerciseData {
    exerciseId: string;
    exerciseName: string;
    exerciseCategory: string;
    sets: number;
    reps: string;
    targetRpe: number | null;
    notes: string;
    order: number;
}

export interface WorkoutTemplateData {
    _id: string;
    week: number;
    day: number;
    label: string;
    exercises: TemplateExerciseData[];
}

export async function getWorkoutTemplate(
    week: number,
    day: number
): Promise<WorkoutTemplateData | null> {
    await dbConnect();

    const template = await ProgramTemplate.findOne({ week, day })
        .populate('exercises.exerciseId', 'name category')
        .lean();

    if (!template) return null;

    const exercises: TemplateExerciseData[] = (template.exercises || []).map(
        (ex: {
            exerciseId: {
                _id: { toString: () => string };
                name?: string;
                category?: string;
            };
            sets: number;
            reps: string;
            targetRpe: number | null;
            notes?: string;
            order: number;
        }) => ({
            exerciseId: ex.exerciseId._id.toString(),
            exerciseName: ex.exerciseId.name ?? '',
            exerciseCategory: ex.exerciseId.category ?? '',
            sets: ex.sets,
            reps: ex.reps,
            targetRpe: ex.targetRpe,
            notes: ex.notes ?? '',
            order: ex.order,
        })
    );

    exercises.sort((a, b) => a.order - b.order);

    return {
        _id: template._id.toString(),
        week: template.week,
        day: template.day,
        label: template.label ?? '',
        exercises,
    };
}
