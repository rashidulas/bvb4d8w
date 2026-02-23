import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITemplateExercise {
    exerciseId: Types.ObjectId;
    sets: number;
    reps: string; // e.g., "5", "5-8", "AMRAP"
    targetRpe: number | null;
    notes?: string;
    order: number;
}

export interface IProgramTemplate extends Document {
    week: number;    // 1–8
    day: number;     // 1–4
    label?: string;  // e.g., "Squat Day", "Bench Day"
    exercises: ITemplateExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const TemplateExerciseSchema = new Schema<ITemplateExercise>(
    {
        exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        sets: { type: Number, required: true },
        reps: { type: String, required: true },
        targetRpe: { type: Number, default: null },
        notes: { type: String, default: '' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const ProgramTemplateSchema = new Schema<IProgramTemplate>(
    {
        week: { type: Number, required: true, min: 1, max: 8 },
        day: { type: Number, required: true, min: 1, max: 4 },
        label: { type: String, default: '' },
        exercises: [TemplateExerciseSchema],
    },
    { timestamps: true }
);

// Compound unique index: one template per week+day combo
ProgramTemplateSchema.index({ week: 1, day: 1 }, { unique: true });

const ProgramTemplate: Model<IProgramTemplate> =
    mongoose.models.ProgramTemplate ||
    mongoose.model<IProgramTemplate>('ProgramTemplate', ProgramTemplateSchema);

export default ProgramTemplate;
