import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        return NextResponse.json({ error: 'MONGODB_URI not set' }, { status: 500 });
    }

    try {
        // Connect
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
        }

        const db = mongoose.connection.db!;

        // Import models
        const { default: Exercise } = await import('@/models/Exercise');
        const { default: ProgramTemplate } = await import('@/models/ProgramTemplate');

        // ── Exercises ───────────────────────────────────────────────────────────
        await Exercise.deleteMany({});
        const exercises = await Exercise.insertMany([
            { name: 'Barbell Back Squat', category: 'Squat' },
            { name: 'Pause Squat', category: 'Squat' },
            { name: 'Front Squat', category: 'Squat' },
            { name: 'High Bar Squat', category: 'Squat' },
            { name: 'Barbell Bench Press', category: 'Bench' },
            { name: 'Paused Bench Press', category: 'Bench' },
            { name: 'Close-Grip Bench Press', category: 'Bench' },
            { name: 'Incline Dumbbell Press', category: 'Push' },
            { name: 'Conventional Deadlift', category: 'Deadlift' },
            { name: 'Romanian Deadlift', category: 'Leg' },
            { name: 'Sumo Deadlift', category: 'Deadlift' },
            { name: 'Deficit Deadlift', category: 'Deadlift' },
            { name: 'Good Morning', category: 'Leg' },
            { name: 'Overhead Press', category: 'Push' },
            { name: 'Dumbbell Shoulder Press', category: 'Push' },
            { name: 'Tricep Pushdown', category: 'Push' },
            { name: 'Skull Crushers', category: 'Push' },
            { name: 'Lateral Raise', category: 'Push' },
            { name: 'Chest-Supported Row', category: 'Pull' },
            { name: 'Cable Row', category: 'Pull' },
            { name: 'Pull-Up', category: 'Pull' },
            { name: 'Lat Pulldown', category: 'Pull' },
            { name: 'Barbell Row', category: 'Pull' },
            { name: 'Face Pull', category: 'Pull' },
            { name: 'Dumbbell Curl', category: 'Pull' },
            { name: 'Barbell Curl', category: 'Pull' },
            { name: 'Hammer Curl', category: 'Pull' },
            { name: 'Leg Press', category: 'Leg' },
            { name: 'Leg Curl', category: 'Leg' },
            { name: 'Leg Extension', category: 'Leg' },
            { name: 'Calf Raise', category: 'Leg' },
            { name: 'Bulgarian Split Squat', category: 'Leg' },
            { name: 'Ab Wheel Rollout', category: 'Core' },
            { name: 'Hanging Leg Raise', category: 'Core' },
            { name: 'Plank', category: 'Core' },
            { name: 'Cable Crunch', category: 'Core' },
            { name: 'Back Extension', category: 'Core' },
        ]);

        const m: Record<string, string> = {};
        exercises.forEach(ex => { m[ex.name] = ex._id.toString(); });

        // ── Program Templates ───────────────────────────────────────────────────
        await ProgramTemplate.deleteMany({});

        const rpeTable = [6, 7, 7.5, 6, 8, 8.5, 9, 7.5];
        const dayLabels = ['', 'Squat Day', 'Bench Day', 'Deadlift Day', 'Upper Accessory'];
        const templates = [];

        for (let week = 1; week <= 8; week++) {
            const r = rpeTable[week - 1];
            const low = Math.max(r - 1, 5);
            for (let day = 1; day <= 4; day++) {
                let exArray: object[] = [];
                if (day === 1) {
                    exArray = [
                        { exerciseId: m['Barbell Back Squat'], sets: 4, reps: '5', targetRpe: r, notes: 'Competition grip', order: 0 },
                        { exerciseId: m['Pause Squat'], sets: 3, reps: '3', targetRpe: r, notes: '3-second pause in hole', order: 1 },
                        { exerciseId: m['Romanian Deadlift'], sets: 3, reps: '8', targetRpe: r, notes: 'Slow eccentric', order: 2 },
                        { exerciseId: m['Leg Press'], sets: 3, reps: '10', targetRpe: low, notes: 'Feet shoulder-width', order: 3 },
                        { exerciseId: m['Leg Curl'], sets: 3, reps: '12', targetRpe: low, notes: 'Full ROM', order: 4 },
                        { exerciseId: m['Calf Raise'], sets: 4, reps: '15', targetRpe: low, notes: 'Slow eccentric', order: 5 },
                        { exerciseId: m['Ab Wheel Rollout'], sets: 3, reps: '10', targetRpe: low, notes: '', order: 6 },
                    ];
                } else if (day === 2) {
                    exArray = [
                        { exerciseId: m['Barbell Bench Press'], sets: 4, reps: '5', targetRpe: r, notes: 'Touch-and-go', order: 0 },
                        { exerciseId: m['Paused Bench Press'], sets: 3, reps: '3', targetRpe: r, notes: '1-second pause on chest', order: 1 },
                        { exerciseId: m['Overhead Press'], sets: 3, reps: '8', targetRpe: r, notes: 'Strict form', order: 2 },
                        { exerciseId: m['Incline Dumbbell Press'], sets: 3, reps: '10', targetRpe: low, notes: '', order: 3 },
                        { exerciseId: m['Tricep Pushdown'], sets: 3, reps: '12', targetRpe: low, notes: 'Rope or bar', order: 4 },
                        { exerciseId: m['Lateral Raise'], sets: 4, reps: '15', targetRpe: low, notes: '2-0-2 tempo', order: 5 },
                    ];
                } else if (day === 3) {
                    exArray = [
                        { exerciseId: m['Conventional Deadlift'], sets: 4, reps: '4', targetRpe: r, notes: 'Hook grip preferred', order: 0 },
                        { exerciseId: m['Deficit Deadlift'], sets: 3, reps: '3', targetRpe: r, notes: '1-2" deficit', order: 1 },
                        { exerciseId: m['Front Squat'], sets: 3, reps: '5', targetRpe: r, notes: 'Alternatively Pause Squat', order: 2 },
                        { exerciseId: m['Good Morning'], sets: 3, reps: '8', targetRpe: low, notes: 'Light weight', order: 3 },
                        { exerciseId: m['Leg Press'], sets: 3, reps: '10', targetRpe: low, notes: 'Narrow stance', order: 4 },
                        { exerciseId: m['Ab Wheel Rollout'], sets: 3, reps: '12', targetRpe: low, notes: '', order: 5 },
                        { exerciseId: m['Back Extension'], sets: 3, reps: '12', targetRpe: low, notes: 'Bodyweight or light plate', order: 6 },
                    ];
                } else {
                    exArray = [
                        { exerciseId: m['Chest-Supported Row'], sets: 4, reps: '10', targetRpe: r, notes: 'Full retraction', order: 0 },
                        { exerciseId: m['Cable Row'], sets: 3, reps: '12', targetRpe: low, notes: 'Wide or close grip', order: 1 },
                        { exerciseId: m['Pull-Up'], sets: 4, reps: 'AMRAP', targetRpe: r, notes: 'Add weight if >10 reps', order: 2 },
                        { exerciseId: m['Lat Pulldown'], sets: 3, reps: '12', targetRpe: low, notes: 'Wide overhand', order: 3 },
                        { exerciseId: m['Dumbbell Curl'], sets: 3, reps: '12', targetRpe: low, notes: 'Supinate at top', order: 4 },
                        { exerciseId: m['Hammer Curl'], sets: 3, reps: '10', targetRpe: low, notes: 'Alternate arms', order: 5 },
                        { exerciseId: m['Face Pull'], sets: 4, reps: '15', targetRpe: low, notes: 'External rotation', order: 6 },
                    ];
                }
                templates.push({ week, day, label: `Week ${week} — ${dayLabels[day]}`, exercises: exArray });
            }
        }

        await ProgramTemplate.insertMany(templates);

        return NextResponse.json({
            success: true,
            exercisesInserted: exercises.length,
            templatesInserted: templates.length,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
