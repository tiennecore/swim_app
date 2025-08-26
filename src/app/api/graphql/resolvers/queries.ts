import { prisma } from "@/lib/prisma";

export const queryResolvers = {
    Query: {
        profiles: async () => {
            return prisma.profile.findMany();
        },
        profile: async (_: any, args: { id: string }) => {
            return prisma.profile.findUnique({
                where: { id: args.id },
            });
        },
        workouts: async () => {
            return prisma.workout.findMany();
        },
        workout: async (_: any, args: { id: string }) => {
            return prisma.workout.findUnique({
                where: { id: args.id },
            });
        },
        blocks: async () => {
            return prisma.block.findMany();
        },
        exercises: async () => {
            return prisma.exercise.findMany();
        },
        likes: async () => {
            return prisma.like.findMany();
        },
    },
};
