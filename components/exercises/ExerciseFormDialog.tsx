'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    createExercise,
    updateExercise,
    ExerciseData,
} from '@/lib/actions/exercises';
import { EXERCISE_CATEGORIES, ExerciseCategory } from '@/lib/constants';


interface ExerciseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exercise?: ExerciseData | null;
    onSaved: (exercise: ExerciseData) => void;
}

export function ExerciseFormDialog({
    open,
    onOpenChange,
    exercise,
    onSaved,
}: ExerciseFormDialogProps) {
    const [name, setName] = useState(exercise?.name ?? '');
    const [category, setCategory] = useState<ExerciseCategory>(
        exercise?.category ?? 'Accessory'
    );
    const [isPending, startTransition] = useTransition();

    const isEditing = !!exercise;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Exercise name is required');
            return;
        }

        startTransition(async () => {
            if (isEditing && exercise) {
                const result = await updateExercise(exercise._id, { name: name.trim(), category });
                if (result.success) {
                    toast.success(`"${name.trim()}" updated`);
                    onSaved({ ...exercise, name: name.trim(), category });
                    onOpenChange(false);
                } else {
                    toast.error(result.error ?? 'Failed to update exercise');
                }
            } else {
                const result = await createExercise({ name: name.trim(), category });
                if (result.success) {
                    toast.success(`"${name.trim()}" added`);
                    // Re-fetch happens via revalidatePath; we pass a placeholder to trigger list refresh
                    onSaved({
                        _id: Date.now().toString(),
                        name: name.trim(),
                        category,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                    setName('');
                    setCategory('Accessory');
                    onOpenChange(false);
                } else {
                    toast.error(result.error ?? 'Failed to create exercise');
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the exercise name and category.' : 'Add a new exercise to your database.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="exercise-name">Exercise Name</Label>
                        <Input
                            id="exercise-name"
                            placeholder="e.g. Barbell Back Squat"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="exercise-category">Category</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as ExerciseCategory)}>
                            <SelectTrigger id="exercise-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXERCISE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Exercise'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
