// src/app/entrainements/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// --- Définitions GraphQL ---
const GET_ALL_WORKOUTS_QUERY = gql`
  query GetAllWorkouts($anonymousId: String) {
    getAllWorkouts {
      id
      name
      totalDistance
      creatorName
      workoutType
      likeCount
      isLikedByUser(anonymousId: $anonymousId)
      isAlreadyAdded
      blocks {
        exercises {
          equipment
        }
      }
    }
  }
`;

const DUPLICATE_WORKOUT_MUTATION = gql`
    mutation DuplicateWorkout($workoutId: ID!) {
        duplicateWorkout(workoutId: $workoutId) {
            id
            name
        }
    }
`;

const TOGGLE_LIKE_WORKOUT_MUTATION = gql`
    mutation ToggleLikeWorkout($workoutId: ID!, $anonymousId: String) {
        toggleLikeWorkout(workoutId: $workoutId, anonymousId: $anonymousId) {
            id
            likeCount
            isLikedByUser(anonymousId: $anonymousId)
        }
    }
`;

// --- Constantes pour l'affichage ---
const WORKOUT_TYPES = {
    'ENDURANCE': 'Endurance',
    'VITESSE_PUISSANCE': 'Vitesse',
    'TECHNIQUE': 'Technique',
    'RECUPERATION': 'Récupération',
    'MIXTE': 'Mixte'
};
const BASE_EQUIPMENTS = { 'PALMES': 'Palmes', 'TUBA': 'Tuba', 'PULL_BUOY': 'Pull-buoy', 'PLAQUETTES': 'Plaquettes', 'PLANCHES': 'Planches' };


export default function TousLesEntrainementsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [anonymousId, setAnonymousId] = useState<string | null>(null);

    useEffect(() => {
        let anonId = localStorage.getItem('anonymousId');
        if (!anonId) {
            anonId = uuidv4();
            localStorage.setItem('anonymousId', anonId);
        }
        setAnonymousId(anonId);
    }, []);

    const { data, loading, error, refetch } = useQuery(GET_ALL_WORKOUTS_QUERY, {
        variables: { anonymousId },
        skip: !anonymousId,
    });

    const [duplicateWorkout, { loading: duplicateLoading }] = useMutation(DUPLICATE_WORKOUT_MUTATION, {
        onCompleted: () => {
            alert("Entraînement ajouté à votre liste !");
            refetch();
        },
        onError: (err) => alert(`Erreur: ${err.message}`),
    });

    const [toggleLike] = useMutation(TOGGLE_LIKE_WORKOUT_MUTATION, {
        onCompleted: () => refetch({ anonymousId }),
        onError: (err) => alert(`Erreur: ${err.message}`),
    });

    const handleAddWorkout = (workoutId: string) => {
        if (!user) {
            router.push('/connexion');
            return;
        }
        duplicateWorkout({ variables: { workoutId } });
    };

    const handleLike = (workoutId: string) => {
        toggleLike({ variables: { workoutId, anonymousId: user ? null : anonymousId } });
    };

    const getUniqueEquipment = (blocks: any[]) => {
        const equipmentSet = new Set<string>();
        blocks.forEach(block => {
            block.exercises.forEach((ex: any) => {
                ex.equipment.forEach((eq: string) => equipmentSet.add(eq));
            });
        });
        return Array.from(equipmentSet);
    };

    if (loading || !anonymousId) return <p className="text-center mt-8">Chargement des entraînements...</p>;
    if (error) return <p className="text-center mt-8 text-red-600">Erreur: {error.message}</p>;

    const workouts = data?.getAllWorkouts || [];

    return (
        <div className="min-h-screen">
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Bibliothèque d'entraînements</h1>
                    <Link href="/creer-entrainement" className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700">
                        Créer un entraînement
                    </Link>
                </div>

                {workouts.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-slate-700">Aucun entraînement trouvé</h3>
                        <p className="text-slate-500 mt-2">Soyez le premier à en créer un !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workouts.map((workout: any) => {
                            const equipment = getUniqueEquipment(workout.blocks);
                            return (
                                <div key={workout.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {workout.workoutType && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{WORKOUT_TYPES[workout.workoutType as keyof typeof WORKOUT_TYPES]}</span>}
                                            {equipment.map(eq => <span key={eq} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full font-medium">{BASE_EQUIPMENTS[eq as keyof typeof BASE_EQUIPMENTS] || eq}</span>)}
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-800">{workout.name}</h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Par {workout.creatorName || 'Anonyme'}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Distance : <span className="font-semibold">{workout.totalDistance}m</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Link href={`/entrainements/${workout.id}`} className="flex-grow text-center text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-md hover:bg-slate-200">
                                            Voir
                                        </Link>
                                        {workout.isAlreadyAdded ? (
                                            <div className="flex-grow flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-md">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                <span>Ajouté</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddWorkout(workout.id)}
                                                disabled={duplicateLoading}
                                                className="flex-grow text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 disabled:opacity-50"
                                            >
                                                Ajouter
                                            </button>
                                        )}
                                        <button onClick={() => handleLike(workout.id)} className="p-2 rounded-md hover:bg-red-50">
                                            <svg className={`w-6 h-6 ${workout.isLikedByUser ? 'text-red-500 fill-current' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                                            </svg>
                                        </button>
                                        <span className="text-sm font-semibold text-slate-600">{workout.likeCount}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
