// src/app/creer-entrainement/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlockItem, BlockComponent } from '@/components/workout/BlockTile';
import { ExerciseComponent } from '@/components/workout/ExerciseTile';
import AddBlockMenu from '@/components/workout/AddBlockMenu';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// --- Définitions GraphQL ---
const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
      id
      name
      defaultRestTime
      defaultDistance
      defaultPoolLength
      customEquipments { id, name }
      customBreathingRhythms { id, value }
    }
  }
`;
const CREATE_WORKOUT_MUTATION = gql`
  mutation CreateWorkout($name: String!, $blocks: [BlockInput!]!, $workoutType: WorkoutType) {
    createWorkout(name: $name, blocks: $blocks, workoutType: $workoutType) {
      id
      name
    }
  }
`;

// --- Requêtes à rafraîchir ---
const GET_MY_WORKOUTS_QUERY = gql`
  query GetMyWorkouts {
    getMyWorkouts {
      id
    }
  }
`;
const GET_ALL_WORKOUTS_QUERY = gql`
  query GetAllWorkouts($anonymousId: String) {
    getAllWorkouts {
      id
      isLikedByUser(anonymousId: $anonymousId)
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

type ExerciseState = {
    id: number;
    category: 'ECHAUFFEMENT' | 'EXERCICE' | 'RECUPERATION' | 'FIN_DE_SEANCE';
    unit: 'DISTANCE' | 'TEMPS';
    value: number;
    stroke: 'NAGE_LIBRE' | 'CRAWL' | 'BRASSE' | 'DOS_CRAWLE' | 'PAPILLON' | 'QUATRE_NAGES' | 'MIX' | 'DRILLS' | 'NON_DEFINI';
    drill: string | null;
    intensity: 'APPLIQUE' | 'LENT' | 'ENDURANCE' | 'RAPIDE' | 'SPRINT' | null;
    equipment: string[];
    breathingRhythm: number | null;
};

type BlockState = {
    id: number;
    name: string;
    isRepeatable: boolean;
    repetitions: number;
    exercises: ExerciseState[];
};

// --- Composant Principal ---
export default function WorkoutCreatorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { data: profileData, loading: profileLoading } = useQuery(GET_USER_PROFILE, { skip: !user });

    const [workoutName, setWorkoutName] = useState('');
    const [workoutType, setWorkoutType] = useState<keyof typeof WORKOUT_TYPES | null>(null);
    const [poolLength, setPoolLength] = useState(25);
    const [blocks, setBlocks] = useState<BlockState[]>([]);
    const [openOptionsExerciseId, setOpenOptionsExerciseId] = useState<number | null>(null);
    const [activeItem, setActiveItem] = useState<BlockState | ExerciseState | null>(null);
    const [anonymousId, setAnonymousId] = useState<string | null>(null);

    useEffect(() => {
        let anonId = localStorage.getItem('anonymousId');
        if (!anonId) {
            anonId = uuidv4();
            localStorage.setItem('anonymousId', anonId);
        }
        setAnonymousId(anonId);
    }, []);

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

    useEffect(() => {
        if (profileData?.getUserProfile) {
            setPoolLength(profileData.getUserProfile.defaultPoolLength);
        }
    }, [profileData]);

    const [createWorkout, { loading: mutationLoading, error }] = useMutation(CREATE_WORKOUT_MUTATION, {
        onCompleted: (data) => {
            const workoutId = data.createWorkout.id;
            if (!user) {
                localStorage.setItem('anonymousWorkoutId', workoutId);
            }
            router.push(`/entrainements/${workoutId}`);
        },
        refetchQueries: [
            { query: GET_MY_WORKOUTS_QUERY },
            { query: GET_ALL_WORKOUTS_QUERY, variables: { anonymousId } }
        ],
        awaitRefetchQueries: true,
    });

    const getDefaults = () => profileData?.getUserProfile || { defaultDistance: 100, defaultRestTime: 20 };
    const createNewExercise = (category: 'ECHAUFFEMENT' | 'EXERCICE' | 'RECUPERATION' | 'FIN_DE_SEANCE'): ExerciseState => ({ id: Date.now() + Math.random(), category, unit: category === 'RECUPERATION' ? 'TEMPS' : 'DISTANCE', value: category === 'RECUPERATION' ? getDefaults().defaultRestTime : getDefaults().defaultDistance, stroke: 'NAGE_LIBRE', drill: null, intensity: null, equipment: [], breathingRhythm: null });
    const addSimpleExercise = () => setBlocks([...blocks, { id: Date.now() + Math.random(), name: 'Exercice simple', isRepeatable: false, repetitions: 1, exercises: [createNewExercise('ECHAUFFEMENT')] }]);
    const addRepeatableBlock = () => setBlocks([...blocks, { id: Date.now() + Math.random(), name: `Série`, isRepeatable: true, repetitions: 2, exercises: [] }]);
    const deleteBlock = (blockId: number) => setBlocks(blocks.filter(b => b.id !== blockId));
    const addExerciseToBlock = (blockId: number) => setBlocks(blocks.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, createNewExercise('EXERCICE')] } : b));
    const updateBlock = (blockId: number, field: keyof BlockState, value: any) => setBlocks(blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b));

    const deleteExercise = (blockId: number, exerciseId: number) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId) {
                return { ...b, exercises: b.exercises.filter(ex => ex.id !== exerciseId) }
            }
            return b;
        }).filter(b => b.exercises.length > 0 || b.isRepeatable));
    };

    const duplicateExercise = (blockId: number, exerciseId: number) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const exerciseIndex = blocks[blockIndex].exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1) return;

        const exerciseToDuplicate = blocks[blockIndex].exercises[exerciseIndex];
        const newExercise = { ...exerciseToDuplicate, id: Date.now() + Math.random() };

        const newBlocks = [...blocks];
        newBlocks[blockIndex].exercises.splice(exerciseIndex + 1, 0, newExercise);
        setBlocks(newBlocks);
    };

    const duplicateBlock = (blockId: number) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const blockToDuplicate = blocks[blockIndex];
        const newBlock = { ...blockToDuplicate, id: Date.now() + Math.random(), exercises: blockToDuplicate.exercises.map(ex => ({ ...ex, id: Date.now() + Math.random() })) };

        const newBlocks = [...blocks];
        newBlocks.splice(blockIndex + 1, 0, newBlock);
        setBlocks(newBlocks);
    }

    const updateExercise = (blockId: number, exerciseId: number, field: keyof ExerciseState, value: any) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId) {
                return {
                    ...b,
                    exercises: b.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            let updatedEx = { ...ex, [field]: value };
                            if (field === 'category') {
                                const defaults = getDefaults();
                                if (value === 'RECUPERATION') {
                                    updatedEx.unit = 'TEMPS';
                                    updatedEx.value = defaults.defaultRestTime;
                                    updatedEx.stroke = 'NON_DEFINI';
                                } else {
                                    updatedEx.unit = 'DISTANCE';
                                    updatedEx.value = defaults.defaultDistance;
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
        const formattedBlocks = blocks.map(block => ({
            name: block.name,
            repetitions: block.repetitions,
            exercises: block.exercises.map(ex => ({
                category: ex.category, unit: ex.unit, value: Number(ex.value), stroke: ex.stroke,
                drill: ex.drill, intensity: ex.intensity, equipment: ex.equipment,
                breathingRhythm: ex.breathingRhythm ? Number(ex.breathingRhythm) : null,
                details: ''
            }))
        }));
        createWorkout({ variables: { name: workoutName, blocks: formattedBlocks, workoutType } });
    };

    if (profileLoading) return <p>Chargement du profil...</p>;

    const allEquipments = { ...BASE_EQUIPMENTS, ...(profileData?.getUserProfile?.customEquipments.reduce((acc: any, eq: any) => { acc[eq.name] = eq.name; return acc; }, {}) || {}) };
    const allBreathingRhythms = [...BASE_BREATHING_RHYTHMS, ...(profileData?.getUserProfile?.customBreathingRhythms.map((r: any) => r.value) || [])];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Créer un entraînement</h1>
                    <button onClick={handleSubmit} disabled={mutationLoading} className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
                        {mutationLoading ? '...' : 'Enregistrer'}
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
                            <SelectTrigger className="w-full bg-white p-6 rounded-lg shadow-sm">
                                <SelectValue placeholder="Type d'entraînement (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Type d'entraînement</SelectItem>
                                {Object.entries(WORKOUT_TYPES).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(poolLength)} onValueChange={(value) => setPoolLength(Number(value))}>
                            <SelectTrigger className="w-full bg-white p-6 rounded-lg shadow-sm">
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
                                    allEquipments={allEquipments}
                                    allBreathingRhythms={allBreathingRhythms}
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
