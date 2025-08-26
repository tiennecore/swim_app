import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const queryResolvers = {
    Query: {
        me: async (_parent: any, _args: any, ctx: any) => {
            // ⚠️ Ici tu relies à ton auth (par ex. ctx.user.sub venant de Supabase Auth)
            if (!ctx.user) return null;
            return prisma.user.findUnique({
                where: { id: ctx.user.id },
                include: { profile: true },
            });
        },

        workouts: async () => {
            return prisma.workout.findMany({
                include: { profile: true, blocks: true, likes: true },
            });
        },

        workout: async (_: any, args: { id: string }) => {
            return prisma.workout.findUnique({
                where: { id: args.id },
                include: { profile: true, blocks: true, likes: true },
            });
        },
    },
};
