// src/graphql/resolvers/Mutation.ts
import prisma from '@/lib/prisma';
import { createWorkoutSignature } from '../utils';

export const Mutation = {
    createWorkout: async (_: any, { name, blocks, workoutType }: { name: string, blocks: any[], workoutType?: any }, context: any) => {
        const { user } = context;
        let creatorName = null;

        if (user) {
            const profile = await prisma.profiles.findUnique({ where: { id: user.id } });
            if (profile && profile.name) {
                creatorName = profile.name;
            }
        }

        try {
            return await prisma.workout.create({
                data: {
                    name,
                    workoutType,
                    creatorName,
                    profileId: user?.id,
                    blocks: {
                        create: blocks.map(block => ({
                            name: block.name,
                            repetitions: block.repetitions,
                            exercises: { create: block.exercises },
                        })),
                    },
                },
            });
        } catch (error) {
            console.error("Erreur lors de la création de l'entraînement:", error);
            throw new Error("Impossible de créer l'entraînement.");
        }
    },
    claimWorkout: async (_: any, { workoutId }: { workoutId: string }, context: any) => {
        const { user } = context;
        if (!user) throw new Error("Vous devez être connecté.");
        const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
        if (!workout || workout.profileId) throw new Error("Entraînement invalide.");
        return await prisma.workout.update({
            where: { id: workoutId },
            data: { profileId: user.id },
        });
    },
    duplicateWorkout: async (_: any, { workoutId }: { workoutId: string }, context: any) => {
        const { user } = context;
        if (!user) throw new Error("Vous devez être connecté pour dupliquer un entraînement.");

        await prisma.profiles.upsert({
            where: { id: user.id },
            update: {},
            create: { id: user.id }
        });

        const originalWorkout = await prisma.workout.findUnique({
            where: { id: workoutId },
            include: { blocks: { include: { exercises: true } } }
        });

        if (!originalWorkout) throw new Error("Entraînement original non trouvé.");

        const originalSignature = createWorkoutSignature(originalWorkout);
        const userWorkouts = await prisma.workout.findMany({
            where: { profileId: user.id },
            include: { blocks: { include: { exercises: true } } }
        });

        const userWorkoutSignatures = userWorkouts.map(w => createWorkoutSignature(w));
        if (userWorkoutSignatures.includes(originalSignature)) {
            throw new Error("Vous avez déjà cet entraînement dans votre liste.");
        }

        const { name, blocks, creatorName, workoutType } = originalWorkout;

        return await prisma.workout.create({
            data: {
                name: name,
                profileId: user.id,
                creatorName: creatorName,
                workoutType: workoutType,
                blocks: {
                    create: blocks.map(block => ({
                        name: block.name,
                        repetitions: block.repetitions,
                        exercises: {
                            create: block.exercises.map(ex => ({
                                category: ex.category,
                                unit: ex.unit,
                                value: ex.value,
                                stroke: ex.stroke,
                                drill: ex.drill,
                                intensity: ex.intensity,
                                equipment: ex.equipment,
                                breathingRhythm: ex.breathingRhythm,
                                details: ex.details,
                            }))
                        }
                    }))
                }
            }
        });
    },
    toggleLikeWorkout: async (_: any, { workoutId, anonymousId }: { workoutId: string, anonymousId?: string }, context: any) => {
        const { user } = context;
        if (!user && !anonymousId) throw new Error("Identification requise pour liker.");

        const workout = await prisma.workout.findUnique({
            where: { id: workoutId },
            include: { blocks: { include: { exercises: true } } }
        });

        if (!workout) throw new Error("Entraînement non trouvé.");

        const signature = createWorkoutSignature(workout);

        const whereClause = user
            ? { profileId_workoutSignature: { profileId: user.id, workoutSignature: signature } }
            : { anonymousId_workoutSignature: { anonymousId: anonymousId!, workoutSignature: signature } };

        const existingLike = await prisma.like.findUnique({ where: whereClause });

        if (existingLike) {
            await prisma.like.delete({ where: whereClause });
        } else {
            await prisma.like.create({
                data: {
                    workoutSignature: signature,
                    profileId: user?.id,
                    anonymousId: user ? null : anonymousId,
                }
            });
        }

        return workout;
    },
    updateUserProfile: async (_: any, { input }: { input: any }, context: any) => {
        const { user } = context;
        if (!user) {
            throw new Error("Vous devez être connecté pour mettre à jour votre profil.");
        }

        return await prisma.profiles.update({
            where: { id: user.id },
            data: {
                name: input.name,
                defaultPoolLength: input.defaultPoolLength,
                defaultDistance: input.defaultDistance,
                defaultRestTime: input.defaultRestTime,
            },
        });
    },
    deleteWorkout: async (_: any, { workoutId }: { workoutId: string }, context: any) => {
        const { user } = context;
        if (!user) {
            throw new Error("Vous devez être connecté pour supprimer un entraînement.");
        }

        const workoutToDelete = await prisma.workout.findUnique({
            where: { id: workoutId },
        });

        if (!workoutToDelete) {
            throw new Error("Entraînement non trouvé.");
        }

        if (workoutToDelete.profileId !== user.id) {
            throw new Error("Vous n'êtes pas autorisé à supprimer cet entraînement.");
        }

        await prisma.$transaction(async (tx) => {
            await tx.block.deleteMany({
                where: { workoutId: workoutId },
            });
            await tx.workout.delete({
                where: { id: workoutId },
            });
        });

        return true;
    },
    updateWorkout: async (_: any, { workoutId, name, blocks, workoutType }: { workoutId: string, name: string, blocks: any[], workoutType?: any }, context: any) => {
        const { user } = context;
        if (!user) {
            throw new Error("Vous devez être connecté pour modifier un entraînement.");
        }

        const workoutToUpdate = await prisma.workout.findUnique({
            where: { id: workoutId },
        });

        if (!workoutToUpdate || workoutToUpdate.profileId !== user.id) {
            throw new Error("Vous n'êtes pas autorisé à modifier cet entraînement.");
        }

        return await prisma.$transaction(async (tx) => {
            await tx.block.deleteMany({
                where: { workoutId: workoutId },
            });

            const updatedWorkout = await tx.workout.update({
                where: { id: workoutId },
                data: {
                    name,
                    workoutType,
                    blocks: {
                        create: blocks.map(block => ({
                            name: block.name,
                            repetitions: block.repetitions,
                            exercises: { create: block.exercises },
                        })),
                    },
                },
            });

            return updatedWorkout;
        });
    },
};
