'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseFormDialog } from './ExerciseFormDialog';
import { ExerciseData } from '@/lib/actions/exercises';
import { useRouter } from 'next/navigation';

export function AddExerciseButton() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSaved = (_exercise: ExerciseData) => {
        router.refresh();
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add Exercise
            </Button>
            <ExerciseFormDialog
                open={open}
                onOpenChange={setOpen}
                exercise={null}
                onSaved={handleSaved}
            />
        </>
    );
}
