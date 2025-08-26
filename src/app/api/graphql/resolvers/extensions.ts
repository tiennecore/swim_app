import { GraphQLContext } from "../context";

export const extensionResolvers = {
    Workout: {
        totalDistance: async (parent: any, _: any, ctx: GraphQLContext) => {
            const blocks = await ctx.prisma.block.findMany({
                where: { workoutId: parent.id },
                include: { exercises: true },
            });
            return blocks.reduce(
                (sum, block) =>
                    sum +
                    block.exercises.reduce((bSum, ex) => bSum + (ex.distance || 0), 0),
                0
            );
        },

        usedEquipments: async (parent: any, _: any, ctx: GraphQLContext) => {
            const blocks = await ctx.prisma.block.findMany({
                where: { workoutId: parent.id },
                include: { exercises: true },
            });
            const equipments = new Set<string>();
            blocks.forEach((block) =>
                block.exercises.forEach((ex) => {
                    if (ex.equipment) equipments.add(ex.equipment);
                })
            );
            return Array.from(equipments);
        },

        isAddedByUser: async (parent: any, _: any, ctx: GraphQLContext) => {
            if (!ctx.userId) return false;
            const workout = await ctx.prisma.workout.findUnique({
                where: { id: parent.id },
            });
            return workout?.creatorId === ctx.userId;
        },
    },
    Profile: {
        workoutCount: async (parent: any, _: any, ctx: GraphQLContext) => {
            return ctx.prisma.workout.count({
                where: { creatorId: parent.id },
            });
        },

        likesCount: async (parent: any, _: any, ctx: GraphQLContext) => {
            return ctx.prisma.like.count({
                where: { profileId: parent.id },
            });
        },
    },
};
