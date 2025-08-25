// src/app/generateur-ia/page.tsx
'use client'

import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Définition de la mutation GraphQL ---
const GENERATE_WORKOUT_MUTATION = gql`
  mutation GenerateWorkoutFromAI($input: AIWorkoutPreferencesInput!) {
    generateWorkoutFromAI(input: $input) {
      id
      name
    }
  }
`;

// --- Constantes pour le formulaire ---
const OBJECTIVES = {
    'ENDURANCE': 'Améliorer mon endurance',
    'VITESSE_PUISSANCE': 'Gagner en vitesse et puissance',
    'TECHNIQUE': 'Perfectionner ma technique',
    'RECUPERATION': 'Une séance de récupération',
    'MIXTE': 'Un entraînement complet'
};
const LEVELS = {
    'DEBUTANT': 'Débutant',
    'INTERMEDIAIRE': 'Intermédiaire',
    'AVANCE': 'Avancé'
};
const EQUIPMENTS = { 'PALMES': 'Palmes', 'TUBA': 'Tuba', 'PULL_BUOY': 'Pull-buoy', 'PLAQUETTES': 'Plaquettes', 'PLANCHES': 'Planches' };

export default function GenerateurIaPage() {
    const router = useRouter();
    const [objective, setObjective] = useState('ENDURANCE');
    const [level, setLevel] = useState('INTERMEDIAIRE');
    const [targetType, setTargetType] = useState<'DURATION' | 'DISTANCE'>('DURATION');
    const [duration, setDuration] = useState({ hours: 0, minutes: 45 });
    const [distance, setDistance] = useState(1500);
    const [equipment, setEquipment] = useState<string[]>([]);

    const [generateWorkout, { loading, error }] = useMutation(GENERATE_WORKOUT_MUTATION, {
        onCompleted: (data) => {
            const workoutId = data.generateWorkoutFromAI.id;
            router.push(`/entrainements/${workoutId}`);
        },
        onError: (err) => {
            alert(`Erreur lors de la génération: ${err.message}`);
        }
    });

    const handleEquipmentChange = (item: string) => {
        setEquipment(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleTargetTypeChange = (value: 'DURATION' | 'DISTANCE') => {
        setTargetType(value);
    };

    const handleDistanceChange = (amount: number) => {
        setDistance(prev => {
            const newValue = prev + amount;
            return newValue < 500 ? 500 : newValue; // Maintient un minimum de 500m
        });
    };

    const handleDurationPartChange = (part: 'hours' | 'minutes', value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
            setDuration(prev => ({ ...prev, [part]: numericValue }));
        }
    };

    const handleSubmit = () => {
        const targetValue = targetType === 'DURATION'
            ? duration.hours * 60 + duration.minutes
            : distance;

        generateWorkout({
            variables: {
                input: {
                    objective,
                    level,
                    targetType,
                    targetValue,
                    equipment,
                }
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Générateur d'entraînement par IA</CardTitle>
                    <CardDescription>
                        Laissez notre intelligence artificielle créer une séance sur mesure pour vous.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Quel est votre objectif principal ?</Label>
                        <Select value={objective} onValueChange={setObjective}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un objectif" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(OBJECTIVES).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Quel est votre niveau ?</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre niveau" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(LEVELS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Définir par</Label>
                        <RadioGroup defaultValue="DURATION" value={targetType} onValueChange={(value) => handleTargetTypeChange(value as any)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DURATION" id="duration" />
                                <Label htmlFor="duration">Durée</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DISTANCE" id="distance" />
                                <Label htmlFor="distance">Distance</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            {targetType === 'DURATION' ? 'Durée souhaitée' : 'Distance souhaitée'}
                        </Label>
                        {targetType === 'DURATION' ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1/2">
                                    <Label htmlFor="duration-hours" className="text-xs text-slate-500">Heures</Label>
                                    <Input
                                        id="duration-hours"
                                        type="number"
                                        value={duration.hours}
                                        onChange={e => handleDurationPartChange('hours', e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <Label htmlFor="duration-minutes" className="text-xs text-slate-500">Minutes</Label>
                                    <Input
                                        id="duration-minutes"
                                        type="number"
                                        value={duration.minutes}
                                        onChange={e => handleDurationPartChange('minutes', e.target.value)}
                                        min="0"
                                        max="59"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-6">
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" onClick={() => handleDistanceChange(-1000)} className="w-24 h-12">-1000</Button>
                                    <Button type="button" variant="outline" onClick={() => handleDistanceChange(-100)} className="w-24 h-12">-100</Button>
                                </div>
                                <Input
                                    id="targetValue"
                                    type="text"
                                    readOnly
                                    value={`${distance} m`}
                                    className="text-center font-bold text-lg h-14 w-28"
                                />
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" onClick={() => handleDistanceChange(100)} className="w-24 h-12">+100</Button>
                                    <Button type="button" variant="outline" onClick={() => handleDistanceChange(1000)} className="w-24 h-12">+1000</Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Matériel disponible</Label>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {Object.entries(EQUIPMENTS).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox id={key} checked={equipment.includes(key)} onCheckedChange={() => handleEquipmentChange(key)} />
                                    <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {value}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? "Génération en cours..." : "Générer mon entraînement"}
                    </Button>
                </CardFooter>
            </Card>
            {error && <p className="mt-4 text-center text-red-600">Erreur: {error.message}</p>}
        </div>
    );
}
