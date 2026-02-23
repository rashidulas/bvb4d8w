/**
 * Client-safe constants — no Node.js or Mongoose imports here.
 * Import from here in Client Components instead of from models/.
 */

export type ExerciseCategory =
    | 'Squat'
    | 'Bench'
    | 'Deadlift'
    | 'Push'
    | 'Pull'
    | 'Leg'
    | 'Core'
    | 'Accessory';

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
    'Squat',
    'Bench',
    'Deadlift',
    'Push',
    'Pull',
    'Leg',
    'Core',
    'Accessory',
];
