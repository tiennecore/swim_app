import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const mutationResolvers = {
    Mutation: {
        createWorkout: async (_: any, args: { profileId: string; name: string }) => {
            return prisma.workout.create({
                data: {
                    name: args.name,
                    profileId: args.profileId,
                },
            });
        },

        claimWorkout: async (_: any, args: { workoutId: string; profileId: string }) => {
            return prisma.workout.update({
                where: { id: args.workoutId },
                data: { profileId: args.profileId },
            });
        },

        duplicateWorkout: async (_: any, args: { workoutId: string }) => {
            const workout = await prisma.workout.findUnique({
                where: { id: args.workoutId },
                include: { blocks: { include: { exercises: true } } },
            });

            if (!workout) throw new Error("Workout not found");

            return prisma.workout.create({
                data: {
                    name: `${workout.name} (copy)`,
                    profileId: workout.profileId,
                    blocks: {
                        create: workout.blocks.map((block) => ({
                            name: block.name,
                            exercises: {
                                create: block.exercises.map((ex) => ({
                                    category: ex.category,
                                    value: ex.value,
                                    unit: ex.unit,
                                    repetitions: ex.repetitions,
                                    duration: ex.duration,
                                    drill: ex.drill,
                                    equipment: ex.equipment,
                                    details: ex.details,
                                })),
                            },
                        })),
                    },
                },
            });
        },

        toggleLikeWorkout: async (_: any, args: { workoutId: string; profileId: string }) => {
            const existing = await prisma.like.findFirst({
                where: { workoutId: args.workoutId, profileId: args.profileId },
            });

            if (existing) {
                await prisma.like.delete({ where: { id: existing.id } });
                return { success: true, message: "Like removed" };
            } else {
                await prisma.like.create({
                    data: { workoutId: args.workoutId, profileId: args.profileId },
                });
                return { success: true, message: "Like added" };
            }
        },

        updateUserProfile: async (_: any, args: { id: string; email?: string }) => {
            return prisma.profile.update({
                where: { id: args.id },
                data: { user: { update: { email: args.email ?? undefined } } },
            });
        },

        deleteWorkout: async (_: any, args: { workoutId: string }) => {
            return prisma.workout.delete({
                where: { id: args.workoutId },
            });
        },

        updateWorkout: async (_: any, args: { workoutId: string; name?: string }) => {
            return prisma.workout.update({
                where: { id: args.workoutId },
                data: { name: args.name ?? undefined },
            });
        },
    },
};
