import mongoose, { Schema, Document, Model } from 'mongoose';
import { ExerciseCategory, EXERCISE_CATEGORIES } from '@/lib/constants';

// Re-export for server-side code that needs them
export type { ExerciseCategory };
export { EXERCISE_CATEGORIES };

export interface IExercise extends Document {
    name: string;
    category: ExerciseCategory;
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
    {
        name: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: EXERCISE_CATEGORIES,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate model registration during hot-reloads
const Exercise: Model<IExercise> =
    mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);

export default Exercise;
