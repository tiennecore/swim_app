// src/app/profil/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// --- Définitions GraphQL ---
const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
      id
      name
      defaultRestTime
      defaultDistance
      defaultPoolLength
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
    mutation UpdateUserProfile($input: UpdateProfileInput!) {
        updateUserProfile(input: $input) {
            id
            name
            defaultPoolLength
            defaultDistance
            defaultRestTime
        }
    }
`;

export default function ProfilPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { data, loading, error } = useQuery(GET_USER_PROFILE, { skip: !user });

    const [name, setName] = useState('');
    const [poolLength, setPoolLength] = useState(25);
    const [distance, setDistance] = useState(100);
    const [restTime, setRestTime] = useState(20);

    useEffect(() => {
        if (data?.getUserProfile) {
            const profile = data.getUserProfile;
            setName(profile.name || '');
            setPoolLength(profile.defaultPoolLength);
            setDistance(profile.defaultDistance);
            setRestTime(profile.defaultRestTime);
        }
    }, [data]);

    const [updateProfile, { loading: updateLoading }] = useMutation(UPDATE_USER_PROFILE, {
        onCompleted: () => {
            alert("Profil mis à jour avec succès !");
        },
        onError: (err) => {
            alert(`Erreur: ${err.message}`);
        }
    });

    const handleSave = () => {
        updateProfile({
            variables: {
                input: {
                    name,
                    defaultPoolLength: poolLength,
                    defaultDistance: distance,
                    defaultRestTime: restTime,
                }
            }
        });
    };

    if (loading) return <p className="text-center mt-8">Chargement du profil...</p>;
    if (error) return <p className="text-center mt-8 text-red-600">Erreur: {error.message}</p>;
    if (!user) {
        router.push('/connexion');
        return null;
    }

    return (
        <div className="min-h-screen">
            <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">Mon Profil</h1>

                <div className="space-y-8">
                    {/* Section Informations du compte */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-3">Informations du compte</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Email</label>
                                <p className="text-slate-800 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-500">Surnom utilisé pour les entrainement créer (optionnel)</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section Préférences par défaut */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-3">Préférences par défaut</h2>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="poolLength" className="text-sm font-medium text-slate-500">Piscine</label>
                                <select id="poolLength" value={poolLength} onChange={e => setPoolLength(Number(e.target.value))} className="mt-1 w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="25">25m</option>
                                    <option value="50">50m</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="distance" className="text-sm font-medium text-slate-500">Distance</label>
                                <input id="distance" type="number" step="25" value={distance} onChange={e => setDistance(Number(e.target.value))} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="restTime" className="text-sm font-medium text-slate-500">Repos (sec)</label>
                                <input id="restTime" type="number" step="5" value={restTime} onChange={e => setRestTime(Number(e.target.value))} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={updateLoading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
                            {updateLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
