// src/components/workout/BlockTile.tsx
'use client'

import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableExerciseItem, ExerciseComponent } from './ExerciseTile';

export const BlockComponent = ({ block, handleListeners, ...props }: any) => {
    // Si c'est un exercice simple, on affiche directement la tuile d'exercice
    if (!block.isRepeatable) {
        const exercise = block.exercises[0];
        if (!exercise) return null;

        return (
            <ExerciseComponent
                {...props}
                blockId={block.id}
                exercise={exercise}
                isDraggable={true} // Un exercice simple est toujours déplaçable
                listeners={handleListeners} // On passe les listeners du drag handle
                deleteAction={() => props.deleteBlock(block.id)}
                duplicateAction={() => props.duplicateBlock(block.id)}
            />
        )
    }

    // Si c'est une série
    return (
        <div className="p-4 rounded-lg" style={{ border: '2px solid #2933A8' }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2 w-full">
                    <div {...handleListeners} className="cursor-grab text-slate-400 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="text-sm font-medium text-slate-500">Répéter:</label>
                        <button type="button" onClick={() => props.updateBlock(block.id, 'repetitions', block.repetitions - 1)} disabled={block.repetitions <= 2} className="px-3 py-1 border rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50">-</button>
                        <span className="font-semibold w-6 text-center">{block.repetitions}</span>
                        <button type="button" onClick={() => props.updateBlock(block.id, 'repetitions', block.repetitions + 1)} className="px-3 py-1 border rounded-md bg-slate-100 hover:bg-slate-200">+</button>
                    </div>
                </div>
                <button type="button" onClick={() => props.deleteBlock(block.id)} className="text-sm text-red-600 hover:text-red-800 font-semibold p-2 rounded-md hover:bg-red-50 self-end sm:self-center">Supprimer</button>
            </div>
            <SortableContext items={block.exercises.map((ex: any) => ex.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 pl-4 border-l-4" style={{ borderColor: '#2933A8' }}>
                    {block.exercises.map((ex: any) => (
                        <SortableExerciseItem
                            key={ex.id}
                            {...props}
                            blockId={block.id}
                            exercise={ex}
                            isDraggable={true}
                            deleteAction={() => props.deleteExercise(block.id, ex.id)}
                            duplicateAction={() => props.duplicateExercise(block.id, ex.id)}
                        />
                    ))}
                    <button type="button" onClick={() => props.addExerciseToBlock(block.id)} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Ajouter un exercice à la série</button>
                </div>
            </SortableContext>
        </div>
    );
};

export const SortableBlockItem = (props: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: props.block.id,
        data: { type: 'block', ...props.block }
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <BlockComponent {...props} handleListeners={listeners} />
        </div>
    )
}
