// src/components/workout/ExerciseTile.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// --- Constantes ---
const EXERCISE_CATEGORIES = { 'ECHAUFFEMENT': 'Échauffement', 'EXERCICE': 'Exercice', 'RECUPERATION': 'Récupération', 'FIN_DE_SEANCE': 'Retour au calme' };
const STROKE_TYPES = { 'NAGE_LIBRE': 'Nage libre', 'CRAWL': 'Crawl', 'BRASSE': 'Brasse', 'DOS_CRAWLE': 'Dos crawlé', 'PAPILLON': 'Papillon', 'QUATRE_NAGES': 'Quatre nages', 'MIX': 'Mix', 'DRILLS': 'Drills' };
const DRILLS_LIST = ['Battements sur le côté (Costal)', 'Nage avec un pull-buoy', 'Crawl poings fermés', 'Crawl rattrapé'];
const INTENSITIES = { 'APPLIQUE': 'Appliqué', 'LENT': 'Lent', 'ENDURANCE': 'Endurance', 'RAPIDE': 'Rapide', 'SPRINT': 'Sprint', 'PROGRESSIF': 'Progressif', 'DEGRESSIF': 'Dégressif' };

// Mappage des couleurs par catégorie
const CATEGORY_COLORS: { [key: string]: string } = {
    'ECHAUFFEMENT': '#3b82f6', // blue-500
    'EXERCICE': '#22c55e',     // green-500
    'RECUPERATION': '#f59e0b', // amber-500
    'FIN_DE_SEANCE': '#8b5cf6' // violet-500
};

export const ExerciseComponent = ({ blockId, exercise, updateExercise, deleteAction, duplicateAction, openOptionsExerciseId, setOpenOptionsExerciseId, allEquipments, allBreathingRhythms, poolLength, isDraggable, listeners }: any) => {
    const borderColor = CATEGORY_COLORS[exercise.category] || '#e2e8f0'; // Couleur par défaut

    const [durationInput, setDurationInput] = useState('');

    const formatDuration = (totalSeconds: number | null | undefined) => {
        if (totalSeconds === null || totalSeconds === undefined || totalSeconds === 0) return '';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        setDurationInput(formatDuration(exercise.duration));
    }, [exercise.duration]);

    const handleDurationChange = (value: string) => {
        setDurationInput(value);

        const parts = value.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            const totalSeconds = minutes * 60 + seconds;
            updateExercise(blockId, exercise.id, 'duration', totalSeconds > 0 ? totalSeconds : null);
        } else if (value === '') {
            updateExercise(blockId, exercise.id, 'duration', null);
        }
    };

    return (
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm" style={{ borderLeft: `4px solid ${borderColor}` }}>
            {/* Drag Handle */}
            <div {...(isDraggable ? listeners : {})} className={`p-2 ${isDraggable ? 'cursor-grab text-slate-400' : 'text-transparent'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </div>

            {/* Main Content */}
            <div className="flex-grow w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Col 1 */}
                    <div className="space-y-4">
                        <Select value={exercise.category} onValueChange={(value) => updateExercise(blockId, exercise.id, 'category', value)}>
                            <SelectTrigger className="w-full bg-slate-50">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(EXERCISE_CATEGORIES).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            {exercise.unit === 'DISTANCE' ? (
                                <>
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value - poolLength)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50">-</button>
                                    <Input type="text" readOnly value={exercise.value} className="w-full text-center" />
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value + poolLength)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50">+</button>
                                    <span className="font-medium text-slate-500">m</span>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 w-full">
                                    <Input type="number" value={exercise.value} onChange={(e) => updateExercise(blockId, exercise.id, 'value', Number(e.target.value))} className="w-full text-center" />
                                    <span className="font-medium text-slate-500">s</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Col 2 */}
                    <div className="space-y-4">
                        {exercise.category !== 'RECUPERATION' ? (
                            <>
                                <Select value={exercise.stroke} onValueChange={(value) => updateExercise(blockId, exercise.id, 'stroke', value)}>
                                    <SelectTrigger className="w-full bg-slate-50">
                                        <SelectValue placeholder="Type de nage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STROKE_TYPES).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {exercise.stroke === 'DRILLS' && (
                                    <Select value={exercise.drill || 'none'} onValueChange={(value) => updateExercise(blockId, exercise.id, 'drill', value === 'none' ? null : value)}>
                                        <SelectTrigger className="w-full bg-slate-50">
                                            <SelectValue placeholder="Sélectionner un drill..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sélectionner un drill...</SelectItem>
                                            {DRILLS_LIST.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            </>
                        ) : (
                            <div className="w-full flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value - 1)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50 w-full">-1s</button>
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value + 1)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50 w-full">+1s</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value - 5)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50 w-full">-5s</button>
                                    <button type="button" onClick={() => updateExercise(blockId, exercise.id, 'value', exercise.value + 5)} className="px-3 py-1 border rounded-md bg-white hover:bg-slate-50 w-full">+5s</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {exercise.intensity && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{INTENSITIES[exercise.intensity]}</span>}
                    {exercise.breathingRhythm && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">Respi: {exercise.breathingRhythm}</span>}
                    {exercise.equipment.map((eq: string) => <span key={eq} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full font-medium">{allEquipments[eq]}</span>)}

                    {exercise.category !== 'RECUPERATION' && (
                        <button type="button" onClick={() => setOpenOptionsExerciseId(openOptionsExerciseId === exercise.id ? null : exercise.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-auto">
                            {openOptionsExerciseId === exercise.id ? 'Masquer' : 'Options'}
                        </button>
                    )}
                </div>

                {openOptionsExerciseId === exercise.id && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-6 pt-4 mt-4 border-t">
                        <div className="space-y-4 md:col-span-1">
                            <Select value={exercise.intensity || 'none'} onValueChange={(value) => updateExercise(blockId, exercise.id, 'intensity', value === 'none' ? null : value)}>
                                <SelectTrigger className="w-full bg-slate-50">
                                    <SelectValue placeholder="Intensité" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Intensité</SelectItem>
                                    {Object.entries(INTENSITIES).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={String(exercise.breathingRhythm || 'none')} onValueChange={(value) => updateExercise(blockId, exercise.id, 'breathingRhythm', value === 'none' ? null : Number(value))}>
                                <SelectTrigger className="w-full bg-slate-50">
                                    <SelectValue placeholder="Respiration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Respiration</SelectItem>
                                    {allBreathingRhythms.map((r: any) => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4 md:col-span-1">
                            <label className="text-sm font-medium text-slate-600">Durée</label>
                            <Input
                                type="text"
                                placeholder="mm:ss"
                                value={durationInput}
                                onChange={(e) => handleDurationChange(e.target.value)}
                                className="w-full text-center"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-slate-600">Matériel</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                {Object.entries(allEquipments).map(([key, value]) => (
                                    <label key={key} className="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" checked={exercise.equipment.includes(key)} onChange={() => updateExercise(blockId, exercise.id, 'equipment', key)} className="rounded" />
                                        <span>{value as string}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-2 pl-2">
                <button type="button" onClick={duplicateAction} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v12" />
                            <rect x="3" y="7" width="14" height="14" rx="2" />
                        </g>
                    </svg>
                </button>
                <button type="button" onClick={deleteAction} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6" />
                            <path d="M4 6h16M9 3h6" />
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export const SortableExerciseItem = (props: any) => {
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
