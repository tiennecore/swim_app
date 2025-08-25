// src/app/api/download/[workoutId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// --- Constantes pour l'affichage ---
const STROKE_TYPES = { 'NAGE_LIBRE': 'Nage libre', 'CRAWL': 'Crawl', 'BRASSE': 'Brasse', 'DOS_CRAWLE': 'Dos crawlé', 'PAPILLON': 'Papillon', 'QUATRE_NAGES': 'Quatre nages', 'MIX': 'Mix', 'DRILLS': 'Drills', 'NON_DEFINI': 'Non défini' };
const INTENSITIES = { 'APPLIQUE': 'Appliqué', 'LENT': 'Lent', 'ENDURANCE': 'Endurance', 'RAPIDE': 'Rapide', 'SPRINT': 'Sprint', 'PROGRESSIF': 'Progressif', 'DEGRESSIF': 'Dégressif' };
const BASE_EQUIPMENTS = { 'PALMES': 'Palmes', 'TUBA': 'Tuba', 'PULL_BUOY': 'Pull-buoy', 'PLAQUETTES': 'Plaquettes', 'PLANCHES': 'Planches' };

// Helper function to format the workout into a text string
const formatWorkoutToText = (workout: any) => {
    const totalDistance = workout.blocks.reduce((total: number, block: any) => {
        const blockDistance = block.exercises.reduce((subTotal: number, exercise: any) => {
            if (exercise.unit === 'DISTANCE') {
                return subTotal + exercise.value;
            }
            return subTotal;
        }, 0);
        return total + (blockDistance * block.repetitions);
    }, 0);

    let content = `Distance: ${totalDistance}m\n\n`;

    workout.blocks.forEach((block: any) => {
        const formatExerciseLine = (ex: any, nextEx: any) => {
            let line = `${ex.value}${ex.unit === 'DISTANCE' ? 'm' : 's'}`;

            if (ex.category !== 'RECUPERATION') {
                const stroke = ex.stroke === 'DRILLS' ? ex.drill : STROKE_TYPES[ex.stroke as keyof typeof STROKE_TYPES];
                line += ` ${stroke}`;
            }

            const options = [];
            if (ex.intensity) options.push(INTENSITIES[ex.intensity as keyof typeof INTENSITIES]);
            if (ex.breathingRhythm) options.push(`Respi ${ex.breathingRhythm}`);
            if (ex.equipment.length > 0) options.push(ex.equipment.map((eq: string) => BASE_EQUIPMENTS[eq as keyof typeof BASE_EQUIPMENTS] || eq).join(', '));

            if (options.length > 0) {
                line += ` (${options.join(' / ')})`;
            }

            // Ajoute le temps de repos si l'exercice suivant est une récupération
            if (nextEx && nextEx.category === 'RECUPERATION') {
                line += ` r:${nextEx.value}s`;
            }

            return line;
        };

        if (block.repetitions > 1) {
            content += `x ${block.repetitions}\n`;
            for (let i = 0; i < block.exercises.length; i++) {
                const ex = block.exercises[i];
                if (ex.category === 'RECUPERATION') continue; // Ignore la ligne de récupération

                const nextEx = block.exercises[i + 1];
                content += `  - ${formatExerciseLine(ex, nextEx)}\n`;
            }
        } else {
            for (let i = 0; i < block.exercises.length; i++) {
                const ex = block.exercises[i];
                if (ex.category === 'RECUPERATION') continue;

                const nextEx = block.exercises[i + 1];
                content += `- ${formatExerciseLine(ex, nextEx)}\n`;
            }
        }
    });

    return content.trim();
};

export async function GET(
    request: Request,
    { params }: { params: { workoutId: string } }
) {
    const workoutId = params.workoutId;

    if (!workoutId) {
        return new NextResponse('Workout ID manquant', { status: 400 });
    }

    try {
        const workout = await prisma.workout.findUnique({
            where: { id: workoutId },
            include: {
                blocks: {
                    include: {
                        exercises: true, // Assurez-vous que les exercices sont triés par ordre de création si nécessaire
                    },
                },
            },
        });

        if (!workout) {
            return new NextResponse('Entraînement non trouvé', { status: 404 });
        }

        const textContent = formatWorkoutToText(workout);
        const filename = `${workout.name.replace(/ /g, '_')}.txt`;

        return new NextResponse(textContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la génération du fichier texte:", error);
        return new NextResponse('Erreur interne du serveur', { status: 500 });
    }
}
