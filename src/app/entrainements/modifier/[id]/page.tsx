// src/app/mes-entrainements/modifier/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddBlockMenu from '@/components/workout/AddBlockMenu';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useParams } from 'next/navigation';

// --- Définitions GraphQL ---
const GET_WORKOUT_DETAILS_QUERY = gql`
  query GetWorkout($id: ID!) {
    getWorkout(id: $id) {
      id
      name
      workoutType
      blocks {
        id
        name
        repetitions
        exercises {
          id
          category
          unit
          value
          stroke
          drill
          intensity
          equipment
          breathingRhythm
          duration
          details
        }
      }
    }
  }
`;

const UPDATE_WORKOUT_MUTATION = gql`
  mutation UpdateWorkout($workoutId: ID!, $name: String!, $blocks: [BlockInput!]!, $workoutType: WorkoutType) {
    updateWorkout(workoutId: $workoutId, name: $name, blocks: $blocks, workoutType: $workoutType) {
      id
    }
  }
`;

// --- Constantes et Types ---
const WORKOUT_TYPES = {
    'ENDURANCE': 'Endurance (Aérobie)',
    'VITESSE_PUISSANCE': 'Vitesse & Puissance (Anaérobie)',
    'TECHNIQUE': 'Technique (Éducatifs)',
    'RECUPERATION': 'Récupération Active',
    'MIXTE': 'Mixte / Combiné'
};
const BASE_EQUIPMENTS = { 'PALMES': 'Palmes', 'TUBA': 'Tuba', 'PULL_BUOY': 'Pull-buoy', 'PLAQUETTES': 'Plaquettes', 'PLANCHES': 'Planches' };
const BASE_BREATHING_RHYTHMS = [1, 2, 3, 4, 5, 7];
const EXERCISE_CATEGORIES = { 'ECHAUFFEMENT': 'Échauffement', 'EXERCICE': 'Exercice', 'RECUPERATION': 'Récupération', 'FIN_DE_SEANCE': 'Retour au calme' };
const STROKE_TYPES = { 'NAGE_LIBRE': 'Nage libre', 'CRAWL': 'Crawl', 'BRASSE': 'Brasse', 'DOS_CRAWLE': 'Dos crawlé', 'PAPILLON': 'Papillon', 'QUATRE_NAGES': 'Quatre nages', 'MIX': 'Mix', 'DRILLS': 'Drills', 'NON_DEFINI': 'Non défini' };
const DRILLS_LIST = ['Battements sur le côté (Costal)', 'Nage avec un pull-buoy', 'Crawl poings fermés', 'Crawl rattrapé'];
const INTENSITIES = { 'APPLIQUE': 'Appliqué', 'LENT': 'Lent', 'ENDURANCE': 'Endurance', 'RAPIDE': 'Rapide', 'SPRINT': 'Sprint', 'PROGRESSIF': 'Progressif', 'DEGRESSIF': 'Dégressif' };

type ExerciseState = {
    id: string; // Les ID sont des chaînes de caractères
    category: 'ECHAUFFEMENT' | 'EXERCICE' | 'RECUPERATION' | 'FIN_DE_SEANCE';
    unit: 'DISTANCE' | 'TEMPS';
    value: number;
    stroke: 'NAGE_LIBRE' | 'CRAWL' | 'BRASSE' | 'DOS_CRAWLE' | 'PAPILLON' | 'QUATRE_NAGES' | 'MIX' | 'DRILLS' | 'NON_DEFINI';
    drill: string | null;
    intensity: 'APPLIQUE' | 'LENT' | 'ENDURANCE' | 'RAPIDE' | 'SPRINT' | null;
    equipment: string[];
    breathingRhythm: number | null;
    duration: number | null;
    details: string;
};

type BlockState = {
    id: string; // Les ID sont des chaînes de caractères
    name: string;
    isRepeatable: boolean;
    repetitions: number;
    exercises: ExerciseState[];
};

// --- Sous-composants (intégrés pour éviter les erreurs d'import) ---

const ExerciseComponent = ({ blockId, exercise, updateExercise, deleteAction, duplicateAction, openOptionsExerciseId, setOpenOptionsExerciseId, allEquipments, allBreathingRhythms, poolLength, isDraggable, listeners }: any) => {
    const borderColor = {
        'ECHAUFFEMENT': '#3b82f6',
        'EXERCICE': '#22c55e',
        'RECUPERATION': '#f59e0b',
        'FIN_DE_SEANCE': '#8b5cf6'
    }[exercise.category] || '#e2e8f0';

    return (
        <div className="flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm" style={{ borderLeft: `4px solid ${borderColor}` }}>
            <div {...(isDraggable ? listeners : {})} className={`p-2 pt-12 ${isDraggable ? 'cursor-grab text-slate-400' : 'text-transparent'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </div>
            <div className="flex-grow w-full">
                {/* ... (Contenu de l'exercice, comme avant) ... */}
            </div>
            <div className="flex flex-col items-center justify-center h-full gap-2 pl-2">
                {/* ... (Boutons dupliquer/supprimer, comme avant) ... */}
            </div>
        </div>
    );
};

const SortableExerciseItem = (props: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: props.exercise.id,
        data: { type: 'exercise', blockId: props.blockId },
        disabled: !props.isDraggable,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return <div ref={setNodeRef} style={style} {...attributes}><ExerciseComponent {...props} listeners={listeners} /></div>
}

const BlockComponent = ({ block, children, ...props }: any) => {
    if (!block.isRepeatable) {
        const exercise = block.exercises[0];
        if (!exercise) return null;
        return <SortableExerciseItem {...props} exercise={exercise} blockId={block.id} isDraggable={true} deleteAction={() => props.deleteBlock(block.id)} duplicateAction={() => props.duplicateBlock(block.id)} />;
    }
    return (
        <div className="p-4 rounded-lg" style={{ border: '2px solid #2933A8' }}>
            {/* ... (Logique d'affichage de la série, comme avant) ... */}
        </div>
    );
};

const SortableBlockItem = (props: any) => {
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


// --- Composant Principal ---
export default function ModifierEntrainementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const workoutId = params.id as string;

    const { data: initialData, loading: initialLoading } = useQuery(GET_WORKOUT_DETAILS_QUERY, {
        variables: { id: workoutId },
        skip: !workoutId,
    });

    const [workoutName, setWorkoutName] = useState('');
    const [workoutType, setWorkoutType] = useState<keyof typeof WORKOUT_TYPES | null>(null);
    const [poolLength, setPoolLength] = useState(25);
    const [blocks, setBlocks] = useState<BlockState[]>([]);
    const [openOptionsExerciseId, setOpenOptionsExerciseId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<BlockState | ExerciseState | null>(null);

    useEffect(() => {
        if (initialData?.getWorkout) {
            const workout = initialData.getWorkout;
            setWorkoutName(workout.name);
            setWorkoutType(workout.workoutType);
            const mutableBlocks = JSON.parse(JSON.stringify(workout.blocks));
            const formattedBlocks = mutableBlocks.map((block: any) => ({
                ...block,
                isRepeatable: block.repetitions > 1,
            }));
            setBlocks(formattedBlocks);
        }
    }, [initialData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [updateWorkout, { loading: updateLoading }] = useMutation(UPDATE_WORKOUT_MUTATION, {
        onCompleted: () => {
            router.push('/mes-entrainements');
        },
        onError: (err) => alert(`Erreur: ${err.message}`),
    });

    const addSimpleExercise = () => setBlocks([...blocks, { id: String(Date.now() + Math.random()), name: 'Exercice simple', isRepeatable: false, repetitions: 1, exercises: [{ id: String(Date.now() + Math.random()), category: 'ECHAUFFEMENT', unit: 'DISTANCE', value: 100, stroke: 'NAGE_LIBRE', drill: null, intensity: null, equipment: [], breathingRhythm: null, duration: null, details: 'R:20s' }] }]);
    const addRepeatableBlock = () => setBlocks([...blocks, { id: String(Date.now() + Math.random()), name: `Série`, isRepeatable: true, repetitions: 2, exercises: [] }]);
    const deleteBlock = (blockId: string) => setBlocks(blocks.filter(b => b.id !== blockId));
    const addExerciseToBlock = (blockId: string) => setBlocks(blocks.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, { id: String(Date.now() + Math.random()), category: 'EXERCICE', unit: 'DISTANCE', value: 100, stroke: 'NAGE_LIBRE', drill: null, intensity: null, equipment: [], breathingRhythm: null, duration: null, details: 'R:20s' }] } : b));
    const updateBlock = (blockId: string, field: keyof BlockState, value: any) => setBlocks(blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b));

    const deleteExercise = (blockId: string, exerciseId: string) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId) {
                return { ...b, exercises: b.exercises.filter(ex => ex.id !== exerciseId) }
            }
            return b;
        }).filter(b => b.exercises.length > 0 || b.isRepeatable));
    };

    const duplicateExercise = (blockId: string, exerciseId: string) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const exerciseIndex = blocks[blockIndex].exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1) return;

        const exerciseToDuplicate = blocks[blockIndex].exercises[exerciseIndex];
        const newExercise = { ...exerciseToDuplicate, id: String(Date.now() + Math.random()) };

        const newBlocks = [...blocks];
        newBlocks[blockIndex].exercises.splice(exerciseIndex + 1, 0, newExercise);
        setBlocks(newBlocks);
    };

    const duplicateBlock = (blockId: string) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const blockToDuplicate = blocks[blockIndex];
        const newBlock = { ...blockToDuplicate, id: String(Date.now() + Math.random()), exercises: blockToDuplicate.exercises.map(ex => ({ ...ex, id: String(Date.now() + Math.random()) })) };

        const newBlocks = [...blocks];
        newBlocks.splice(blockIndex + 1, 0, newBlock);
        setBlocks(newBlocks);
    }

    const updateExercise = (blockId: string, exerciseId: string, field: keyof ExerciseState, value: any) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId) {
                return {
                    ...b,
                    exercises: b.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            let updatedEx = { ...ex, [field]: value };
                            if (field === 'category') {
                                if (value === 'RECUPERATION') {
                                    updatedEx.unit = 'TEMPS';
                                    updatedEx.stroke = 'NON_DEFINI';
                                } else {
                                    updatedEx.unit = 'DISTANCE';
                                }
                            }
                            if (field === 'equipment') {
                                const newEquipment = [...ex.equipment];
                                if (newEquipment.includes(value)) updatedEx.equipment = newEquipment.filter(item => item !== value);
                                else updatedEx.equipment = [...newEquipment, value];
                            }
                            if (field === 'stroke' && value !== 'DRILLS') {
                                updatedEx.drill = null;
                            }
                            return updatedEx;
                        }
                        return ex;
                    })
                };
            }
            return b;
        }));
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        if (active.data.current?.type === 'block') {
            setActiveItem(blocks.find(b => b.id === active.id) || null);
        }
        if (active.data.current?.type === 'exercise') {
            const block = blocks.find(b => b.id === active.data.current.blockId);
            setActiveItem(block?.exercises.find(ex => ex.id === active.id) || null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveItem(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeType = active.data.current?.type;

        if (activeType === 'block') {
            setBlocks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        if (activeType === 'exercise') {
            const sourceBlockId = active.data.current?.blockId;
            const destBlockId = over.data.current?.type === 'exercise' ? over.data.current?.blockId : over.id;

            if (sourceBlockId !== destBlockId) return;

            setBlocks(currentBlocks => {
                const blockIndex = currentBlocks.findIndex(b => b.id === sourceBlockId);
                if (blockIndex === -1) return currentBlocks;

                const oldExerciseIndex = currentBlocks[blockIndex].exercises.findIndex(ex => ex.id === active.id);
                const newExerciseIndex = currentBlocks[blockIndex].exercises.findIndex(ex => ex.id === over.id);

                const newExercises = arrayMove(currentBlocks[blockIndex].exercises, oldExerciseIndex, newExerciseIndex);

                const newBlocks = [...currentBlocks];
                newBlocks[blockIndex] = { ...newBlocks[blockIndex], exercises: newExercises };

                return newBlocks;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedBlocks = blocks.map(({ id, __typename, isRepeatable, ...block }) => ({
            ...block,
            exercises: block.exercises.map(({ id, __typename, ...ex }) => ex)
        }));

        updateWorkout({ variables: { workoutId, name: workoutName, blocks: formattedBlocks, workoutType } });
    };

    if (initialLoading) return <p>Chargement de l'entraînement...</p>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Modifier l'entraînement</h1>
                    <button onClick={handleSubmit} disabled={updateLoading} className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
                        {updateLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input
                            id="workoutName"
                            type="text"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="Nom de l'entraînement"
                            className="bg-white p-6 text-lg rounded-lg shadow-sm lg:col-span-1"
                        />
                        <Select value={workoutType || 'none'} onValueChange={(value) => setWorkoutType(value === 'none' ? null : value as keyof typeof WORKOUT_TYPES)}>
                            <SelectTrigger className="w-full bg-white p-6 text-lg rounded-lg shadow-sm">
                                <SelectValue placeholder="Type d'entraînement (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(WORKOUT_TYPES).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(poolLength)} onValueChange={(value) => setPoolLength(Number(value))}>
                            <SelectTrigger className="w-full bg-white p-6 text-lg rounded-lg shadow-sm">
                                <SelectValue placeholder="Piscine" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">Piscine: 25m</SelectItem>
                                <SelectItem value="50">Piscine: 50m</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {blocks.map((block) => (
                                <SortableBlockItem
                                    key={block.id}
                                    block={block}
                                    updateBlock={updateBlock}
                                    deleteBlock={deleteBlock}
                                    addExerciseToBlock={addExerciseToBlock}
                                    updateExercise={updateExercise}
                                    deleteExercise={deleteExercise}
                                    duplicateExercise={duplicateExercise}
                                    duplicateBlock={duplicateBlock}
                                    openOptionsExerciseId={openOptionsExerciseId}
                                    setOpenOptionsExerciseId={setOpenOptionsExerciseId}
                                    allEquipments={BASE_EQUIPMENTS}
                                    allBreathingRhythms={BASE_BREATHING_RHYTHMS}
                                    poolLength={poolLength}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    <AddBlockMenu onAddExercise={addSimpleExercise} onAddSeries={addRepeatableBlock} />
                </form>
            </div>
            <DragOverlay>
                {activeItem && 'isRepeatable' in activeItem && (
                    <BlockComponent block={activeItem} />
                )}
                {activeItem && 'category' in activeItem && (
                    <ExerciseComponent exercise={activeItem} isDraggable={true} />
                )}
            </DragOverlay>
        </DndContext>
    );
}
