import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILoggedExercise {
    exerciseId: Types.ObjectId;
    exerciseName?: string;   // Denormalised for quick display
    actualLoad: number | null;
    actualReps: number | null;
    actualRpe: number | null;
    notes?: string;
    order: number;
}

export interface IWorkoutLog extends Document {
    date: Date;
    week: number;    // 1–8
    day: number;     // 1–4
    completed: boolean;
    loggedExercises: ILoggedExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const LoggedExerciseSchema = new Schema<ILoggedExercise>(
    {
        exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        exerciseName: { type: String, default: '' },
        actualLoad: { type: Number, default: null },
        actualReps: { type: Number, default: null },
        actualRpe: { type: Number, default: null },
        notes: { type: String, default: '' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
    {
        date: { type: Date, required: true },
        week: { type: Number, required: true, min: 1, max: 8 },
        day: { type: Number, required: true, min: 1, max: 4 },
        completed: { type: Boolean, default: false },
        loggedExercises: [LoggedExerciseSchema],
    },
    { timestamps: true }
);

// Allow multiple logs per week/day (one per date), but keep a convenient index
WorkoutLogSchema.index({ week: 1, day: 1, date: -1 });

const WorkoutLog: Model<IWorkoutLog> =
    mongoose.models.WorkoutLog ||
    mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);

export default WorkoutLog;
