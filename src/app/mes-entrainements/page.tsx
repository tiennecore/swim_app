// src/app/mes-entrainements/page.tsx
'use client'

import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// --- Définitions GraphQL ---
const GET_MY_WORKOUTS_QUERY = gql`
  query GetMyWorkouts {
    getMyWorkouts {
      id
      name
      totalDistance
    }
  }
`;

const DELETE_WORKOUT_MUTATION = gql`
    mutation DeleteWorkout($workoutId: ID!) {
        deleteWorkout(workoutId: $workoutId)
    }
`;

export default function MesEntrainementsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { data, loading, error, refetch } = useQuery(GET_MY_WORKOUTS_QUERY, {
        skip: !user,
    });

    const [deleteWorkout, { loading: deleteLoading }] = useMutation(DELETE_WORKOUT_MUTATION, {
        onCompleted: () => {
            alert("Entraînement supprimé avec succès !");
            refetch(); // Rafraîchit la liste des entraînements
        },
        onError: (err) => alert(`Erreur: ${err.message}`),
    });

    const handleDelete = (workoutId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entraînement ?")) {
            deleteWorkout({ variables: { workoutId } });
        }
    };

    if (!authLoading && !user) {
        router.push('/connexion');
        return null;
    }

    if (loading || authLoading) return <p className="text-center mt-8">Chargement de vos entraînements...</p>;
    if (error) return <p className="text-center mt-8 text-red-600">Erreur: {error.message}</p>;

    const workouts = data?.getMyWorkouts || [];

    return (
        <div className="min-h-screen">
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Mes entraînements</h1>
                    <Link href="/creer-entrainement" className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700">
                        Créer un entraînement
                    </Link>
                </div>

                {workouts.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-slate-700">Vous n'avez aucun entraînement</h3>
                        <p className="text-slate-500 mt-2">Commencez par en créer un ou ajoutez-en depuis la bibliothèque !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workouts.map((workout: any) => (
                            <div key={workout.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{workout.name}</h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Distance totale: <span className="font-semibold">{workout.totalDistance}m</span>
                                    </p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link href={`/entrainements/modifier/${workout.id}`} className="w-full text-center text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-md hover:bg-slate-200">
                                        Modifier
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(workout.id)}
                                        disabled={deleteLoading}
                                        className="w-full text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-md hover:bg-red-100 disabled:opacity-50"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
