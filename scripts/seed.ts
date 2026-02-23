/**
 * Seed Script — 8-Week Powerlifting Program
 * Run with: npm run seed
 */

import mongoose from 'mongoose';
import Exercise from '../models/Exercise.js';
import ProgramTemplate from '../models/ProgramTemplate.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// ── Exercise definitions ──────────────────────────────────────────────────────
const EXERCISES = [
    // Squat
    { name: 'Barbell Back Squat', category: 'Squat' },
    { name: 'Pause Squat', category: 'Squat' },
    { name: 'Front Squat', category: 'Squat' },
    { name: 'High Bar Squat', category: 'Squat' },
    // Bench
    { name: 'Barbell Bench Press', category: 'Bench' },
    { name: 'Paused Bench Press', category: 'Bench' },
    { name: 'Close-Grip Bench Press', category: 'Bench' },
    { name: 'Incline Dumbbell Press', category: 'Push' },
    // Deadlift
    { name: 'Conventional Deadlift', category: 'Deadlift' },
    { name: 'Romanian Deadlift', category: 'Leg' },
    { name: 'Sumo Deadlift', category: 'Deadlift' },
    { name: 'Deficit Deadlift', category: 'Deadlift' },
    { name: 'Good Morning', category: 'Leg' },
    // Push accessories
    { name: 'Overhead Press', category: 'Push' },
    { name: 'Dumbbell Shoulder Press', category: 'Push' },
    { name: 'Tricep Pushdown', category: 'Push' },
    { name: 'Skull Crushers', category: 'Push' },
    { name: 'Lateral Raise', category: 'Push' },
    // Pull accessories
    { name: 'Chest-Supported Row', category: 'Pull' },
    { name: 'Cable Row', category: 'Pull' },
    { name: 'Pull-Up', category: 'Pull' },
    { name: 'Lat Pulldown', category: 'Pull' },
    { name: 'Barbell Row', category: 'Pull' },
    { name: 'Face Pull', category: 'Pull' },
    { name: 'Dumbbell Curl', category: 'Pull' },
    { name: 'Barbell Curl', category: 'Pull' },
    { name: 'Hammer Curl', category: 'Pull' },
    // Leg accessories
    { name: 'Leg Press', category: 'Leg' },
    { name: 'Leg Curl', category: 'Leg' },
    { name: 'Leg Extension', category: 'Leg' },
    { name: 'Calf Raise', category: 'Leg' },
    { name: 'Bulgarian Split Squat', category: 'Leg' },
    // Core
    { name: 'Ab Wheel Rollout', category: 'Core' },
    { name: 'Hanging Leg Raise', category: 'Core' },
    { name: 'Plank', category: 'Core' },
    { name: 'Cable Crunch', category: 'Core' },
    { name: 'Back Extension', category: 'Core' },
] as const;

/** RPE progression over 8 weeks */
function getRpe(week: number): number {
    const progression = [6, 7, 7.5, 6, 8, 8.5, 9, 7.5];
    return progression[week - 1] ?? 7;
}

function dayExercises(
    m: Record<string, string>,
    day: number,
    week: number
) {
    const r = getRpe(week);
    const low = Math.max(r - 1, 5);
    switch (day) {
        case 1:
            return [
                { exerciseId: m['Barbell Back Squat'], sets: 4, reps: '5', targetRpe: r, notes: 'Competition grip, belt optional', order: 0 },
                { exerciseId: m['Pause Squat'], sets: 3, reps: '3', targetRpe: r, notes: '3-second pause in hole', order: 1 },
                { exerciseId: m['Romanian Deadlift'], sets: 3, reps: '8', targetRpe: r, notes: 'Slow eccentric', order: 2 },
                { exerciseId: m['Leg Press'], sets: 3, reps: '10', targetRpe: low, notes: 'Feet shoulder-width', order: 3 },
                { exerciseId: m['Leg Curl'], sets: 3, reps: '12', targetRpe: low, notes: 'Full ROM', order: 4 },
                { exerciseId: m['Calf Raise'], sets: 4, reps: '15', targetRpe: low, notes: 'Slow eccentric', order: 5 },
                { exerciseId: m['Ab Wheel Rollout'], sets: 3, reps: '10', targetRpe: low, notes: '', order: 6 },
            ];
        case 2:
            return [
                { exerciseId: m['Barbell Bench Press'], sets: 4, reps: '5', targetRpe: r, notes: 'Touch-and-go', order: 0 },
                { exerciseId: m['Paused Bench Press'], sets: 3, reps: '3', targetRpe: r, notes: '1-second pause on chest', order: 1 },
                { exerciseId: m['Overhead Press'], sets: 3, reps: '8', targetRpe: r, notes: 'Strict form', order: 2 },
                { exerciseId: m['Incline Dumbbell Press'], sets: 3, reps: '10', targetRpe: low, notes: '', order: 3 },
                { exerciseId: m['Tricep Pushdown'], sets: 3, reps: '12', targetRpe: low, notes: 'Rope or bar', order: 4 },
                { exerciseId: m['Lateral Raise'], sets: 4, reps: '15', targetRpe: low, notes: '2-0-2 tempo', order: 5 },
            ];
        case 3:
            return [
                { exerciseId: m['Conventional Deadlift'], sets: 4, reps: '4', targetRpe: r, notes: 'Hook grip preferred', order: 0 },
                { exerciseId: m['Deficit Deadlift'], sets: 3, reps: '3', targetRpe: r, notes: '1-2" deficit', order: 1 },
                { exerciseId: m['Front Squat'], sets: 3, reps: '5', targetRpe: r, notes: 'Alternatively Pause Squat', order: 2 },
                { exerciseId: m['Good Morning'], sets: 3, reps: '8', targetRpe: low, notes: 'Light weight, hip hinge', order: 3 },
                { exerciseId: m['Leg Press'], sets: 3, reps: '10', targetRpe: low, notes: 'Narrow stance', order: 4 },
                { exerciseId: m['Ab Wheel Rollout'], sets: 3, reps: '12', targetRpe: low, notes: '', order: 5 },
                { exerciseId: m['Back Extension'], sets: 3, reps: '12', targetRpe: low, notes: 'Bodyweight or light plate', order: 6 },
            ];
        case 4:
            return [
                { exerciseId: m['Chest-Supported Row'], sets: 4, reps: '10', targetRpe: r, notes: 'Neutral grip, full retraction', order: 0 },
                { exerciseId: m['Cable Row'], sets: 3, reps: '12', targetRpe: low, notes: 'Wide or close grip', order: 1 },
                { exerciseId: m['Pull-Up'], sets: 4, reps: 'AMRAP', targetRpe: r, notes: 'Add weight if >10 reps', order: 2 },
                { exerciseId: m['Lat Pulldown'], sets: 3, reps: '12', targetRpe: low, notes: 'Wide overhand', order: 3 },
                { exerciseId: m['Dumbbell Curl'], sets: 3, reps: '12', targetRpe: low, notes: 'Supinate at top', order: 4 },
                { exerciseId: m['Hammer Curl'], sets: 3, reps: '10', targetRpe: low, notes: 'Alternate arms', order: 5 },
                { exerciseId: m['Face Pull'], sets: 4, reps: '15', targetRpe: low, notes: 'External rotation, high pulley', order: 6 },
            ];
        default:
            return [];
    }
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
    // Load .env.local FIRST (ESM hoists imports, so we do env loading here)
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(__dirname, '../.env.local');
    try {
        const envContent = readFileSync(envPath, 'utf8');
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (key && !process.env[key]) process.env[key] = val;
        }
    } catch {
        /* rely on shell env */
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('❌  MONGODB_URI is not defined. Create a .env.local file.');
        process.exit(1);
    }

    console.log('🔌  Connecting to MongoDB…');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected.');

    // 1. Seed Exercises
    console.log('\n🏋️  Seeding exercises…');
    await Exercise.deleteMany({});
    const inserted = await Exercise.insertMany(EXERCISES);
    console.log(`   Inserted ${inserted.length} exercises.`);

    const exerciseMap: Record<string, string> = {};
    inserted.forEach((ex) => { exerciseMap[ex.name] = ex._id.toString(); });

    // 2. Seed ProgramTemplates
    console.log('\n📅  Seeding program templates (8 weeks × 4 days)…');
    await ProgramTemplate.deleteMany({});

    const dayLabels = ['', 'Squat Day', 'Bench Day', 'Deadlift Day', 'Upper Accessory'];
    const templates = [];
    for (let week = 1; week <= 8; week++) {
        for (let day = 1; day <= 4; day++) {
            templates.push({
                week,
                day,
                label: `Week ${week} — ${dayLabels[day]}`,
                exercises: dayExercises(exerciseMap, day, week),
            });
        }
    }

    await ProgramTemplate.insertMany(templates);
    console.log(`   Inserted ${templates.length} templates.`);

    console.log('\n🎉  Seed complete! Visit http://localhost:3000 → Training.\n');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
});
