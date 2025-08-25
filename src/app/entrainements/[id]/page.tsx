// src/app/entrainements/[id]/page.tsx
'use client'

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// --- Définition de la requête GraphQL ---
const GET_WORKOUT_DETAILS_QUERY = gql`
  query GetWorkout($id: ID!) {
    getWorkout(id: $id) {
      id
      name
      creatorName
      totalDistance
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
        }
      }
    }
  }
`;

// --- Constantes pour l'affichage ---
const EXERCISE_CATEGORIES = { 'ECHAUFFEMENT': 'Échauffement', 'EXERCICE': 'Exercice', 'RECUPERATION': 'Récupération', 'FIN_DE_SEANCE': 'Retour au calme' };
const STROKE_TYPES = { 'NAGE_LIBRE': 'Nage libre', 'CRAWL': 'Crawl', 'BRASSE': 'Brasse', 'DOS_CRAWLE': 'Dos crawlé', 'PAPILLON': 'Papillon', 'QUATRE_NAGES': 'Quatre nages', 'MIX': 'Mix', 'DRILLS': 'Drills', 'NON_DEFINI': 'Non défini' };
const INTENSITIES = { 'APPLIQUE': 'Appliqué', 'LENT': 'Lent', 'ENDURANCE': 'Endurance', 'RAPIDE': 'Rapide', 'SPRINT': 'Sprint', 'PROGRESSIF': 'Progressif', 'DEGRESSIF': 'Dégressif' };
const BASE_EQUIPMENTS = { 'PALMES': 'Palmes', 'TUBA': 'Tuba', 'PULL_BUOY': 'Pull-buoy', 'PLAQUETTES': 'Plaquettes', 'PLANCHES': 'Planches' };

// --- Fonction pour formater la durée ---
const formatDuration = (totalSeconds: number | null | undefined) => {
    if (totalSeconds === null || totalSeconds === undefined || totalSeconds === 0) return null;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function WorkoutDetailsPage() {
    const params = useParams();
    const { id } = params;

    const { data, loading, error } = useQuery(GET_WORKOUT_DETAILS_QUERY, {
        variables: { id },
        skip: !id,
    });

    if (loading) return <p className="text-center mt-8">Chargement de l'entraînement...</p>;
    if (error) return <p className="text-center mt-8 text-red-600">Erreur: {error.message}</p>;

    const workout = data?.getWorkout;

    if (!workout) return <p className="text-center mt-8">Entraînement non trouvé.</p>;

    return (
        <div className="min-h-screen">
            <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <div className="border-b pb-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">{workout.name}</h1>
                                <p className="text-sm text-slate-500 mt-2">
                                    Par {workout.creatorName || 'Anonyme'} • Distance totale: <span className="font-semibold">{workout.totalDistance}m</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {workout.blocks.map((block: any) => (
                            <div key={block.id}>
                                <h3 className="text-lg font-semibold text-slate-700">
                                    {block.name} {block.repetitions > 1 && `(x${block.repetitions})`}
                                </h3>
                                <ul className="mt-2 space-y-4 pl-4 border-l-2">
                                    {block.exercises.map((ex: any, index: number) => {
                                        if (ex.category === 'RECUPERATION') return null;

                                        const nextEx = block.exercises[index + 1];
                                        const restTime = (nextEx && nextEx.category === 'RECUPERATION') ? nextEx.value : null;

                                        return (
                                            <li key={ex.id} className="text-slate-600">
                                                <div>
                                                    <span className="font-medium">
                                                        {ex.value}{ex.unit === 'DISTANCE' ? 'm' : 's'}
                                                    </span>
                                                    {' '}
                                                    <span>
                                                        {ex.stroke === 'DRILLS' ? ex.drill : STROKE_TYPES[ex.stroke as keyof typeof STROKE_TYPES]}
                                                    </span>
                                                    {restTime && <span className="ml-2 text-slate-500 font-medium">r:{restTime}s</span>}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {ex.intensity && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{INTENSITIES[ex.intensity as keyof typeof INTENSITIES]}</span>}
                                                    {ex.breathingRhythm && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">Respi: {ex.breathingRhythm}</span>}
                                                    {ex.duration && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">⏱️ {formatDuration(ex.duration)}</span>}
                                                    {ex.equipment.map((eq: string) => <span key={eq} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full font-medium">{BASE_EQUIPMENTS[eq as keyof typeof BASE_EQUIPMENTS] || eq}</span>)}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-6 mt-6 flex justify-end gap-2">
                        <a
                            href={`/api/download/${workout.id}`}
                            download={`${workout.name.replace(/ /g, '_')}.txt`}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>.txt</span>
                        </a>
                        <a
                            href={`/api/export/fit/${workout.id}`}
                            download={`${workout.name.replace(/ /g, '_')}.fit`}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Exporter pour Coros</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
