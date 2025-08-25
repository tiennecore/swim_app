// src/graphql/utils.ts

// --- Fonction pour créer une signature unique d'un entraînement ---
export const createWorkoutSignature = (workout: any) => {
    if (!workout.blocks || !Array.isArray(workout.blocks)) {
        return JSON.stringify({ name: workout.name });
    }

    const sortedBlocks = [...workout.blocks].sort((a, b) => a.name.localeCompare(b.name));
    const signatureObject = {
        blocks: sortedBlocks.map(block => {
            const sortedExercises = [...block.exercises].sort((a, b) => a.category.localeCompare(b.category) || a.value - b.value);
            return {
                repetitions: block.repetitions,
                exercises: sortedExercises.map(ex => ({
                    category: ex.category,
                    unit: ex.unit,
                    value: ex.value,
                    stroke: ex.stroke,
                    drill: ex.drill,
                    intensity: ex.intensity,
                    equipment: [...ex.equipment].sort(),
                    breathingRhythm: ex.breathingRhythm,
                    duration: ex.duration
                }))
            };
        })
    };
    return JSON.stringify(signatureObject);
};
