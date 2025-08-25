// src/app/api/export/fit/[workoutId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Fit from '@markw65/fit-file-writer';

export const dynamic = 'force-dynamic'; // Indique à Next.js que cette route est dynamique

// Helper function to format the workout into a .FIT file
const formatWorkoutToFit = (workout: any) => {
    const { FitFileWriter, Enums } = Fit;

    // --- Mappages utilisant les Enums corrigés ---
    const STROKE_TYPE_MAP: { [key: string]: number } = {
        'NAGE_LIBRE': Enums.SwimStroke.FREESTYLE,
        'CRAWL': Enums.SwimStroke.FREESTYLE,
        'BRASSE': Enums.SwimStroke.BREASTSTROKE,
        'DOS_CRAWLE': Enums.SwimStroke.BACKSTROKE,
        'PAPILLON': Enums.SwimStroke.BUTTERFLY,
        'QUATRE_NAGES': Enums.SwimStroke.IM,
        'MIX': Enums.SwimStroke.DRILL,
        'DRILLS': Enums.SwimStroke.DRILL,
        'NON_DEFINI': Enums.SwimStroke.DRILL,
    };

    const INTENSITY_MAP: { [key: string]: number } = {
        'RECUPERATION': Enums.Intensity.REST,
        'LENT': Enums.Intensity.WARMUP,
        'ECHAUFFEMENT': Enums.Intensity.WARMUP,
        'FIN_DE_SEANCE': Enums.Intensity.COOLDOWN,
        'DEFAULT': Enums.Intensity.ACTIVE
    };

    const ffw = new FitFileWriter();

    // Étape 1: Démarrer le fichier
    ffw.start();

    // Étape 2: Écrire les informations de base du fichier
    ffw.writeMessage('file_id', {
        type: 'workout',
        manufacturer: 'development',
        product: 1,
        time_created: new Date(),
        serial_number: 1,
    });

    let stepIndex = 0;
    const workoutSteps: any[] = [];

    // Étape 3: Créer toutes les étapes de l'entraînement
    workout.blocks.forEach((block: any) => {
        for (let i = 0; i < block.repetitions; i++) {
            block.exercises.forEach((ex: any) => {
                const step = {
                    message_index: stepIndex,
                    wkt_step_name: ex.drill || STROKE_TYPE_MAP[ex.stroke],
                    duration_type: ex.unit === 'DISTANCE' ? Enums.WktStepDuration.DISTANCE : Enums.WktStepDuration.TIME,
                    duration_value: ex.value,
                    target_type: Enums.WktStepTarget.OPEN,
                    intensity: INTENSITY_MAP[ex.category as keyof typeof INTENSITY_MAP] || INTENSITY_MAP['DEFAULT'],
                    notes: `Équipement: ${ex.equipment.join(', ')}`,
                    swim_stroke: STROKE_TYPE_MAP[ex.stroke as keyof typeof STROKE_TYPE_MAP] || Enums.SwimStroke.DRILL,
                };
                workoutSteps.push(step);
                stepIndex++;
            });
        }
    });

    // Étape 4: Écrire le message principal de l'entraînement
    ffw.writeMessage('workout', {
        wkt_name: workout.name,
        sport: Enums.Sport.SWIMMING,
        sub_sport: 'lap_swimming',
        num_valid_steps: stepIndex,
    });

    // Étape 5: Écrire toutes les étapes créées
    workoutSteps.forEach(step => {
        ffw.writeMessage('workout_step', step);
    });

    // Étape 6: Finaliser et générer le buffer
    ffw.finish();
    const buffer = ffw.toBuffer();
    return buffer;
};

export async function GET(
    request: Request
) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const workoutId = pathSegments[pathSegments.length - 1];

    if (!workoutId) {
        return new NextResponse('Workout ID manquant', { status: 400 });
    }

    try {
        const workout = await prisma.workout.findUnique({
            where: { id: workoutId },
            include: {
                blocks: {
                    include: {
                        exercises: true,
                    },
                },
            },
        });

        if (!workout) {
            return new NextResponse('Entraînement non trouvé', { status: 404 });
        }

        const fitFileBuffer = formatWorkoutToFit(workout);
        const filename = `${workout.name.replace(/ /g, '_')}.fit`;

        return new NextResponse(fitFileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.ant.fit',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la génération du fichier .FIT:", error);
        return new NextResponse('Erreur interne du serveur', { status: 500 });
    }
}
