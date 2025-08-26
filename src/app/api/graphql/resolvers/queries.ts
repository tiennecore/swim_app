import { GraphQLContext } from "../context";

export const queryResolvers = {
    Query: {
        profiles: (_: any, __: any, ctx: GraphQLContext) => ctx.prisma.profile.findMany(),
        profile: (_: any, { id }: { id: string }, ctx: GraphQLContext) =>
            ctx.prisma.profile.findUnique({ where: { id } }),

        workouts: (_: any, __: any, ctx: GraphQLContext) =>
            ctx.prisma.workout.findMany({
                include: { creator: true, blocks: { include: { exercises: true } }, likes: true },
            }),
        workout: (_: any, { id }: { id: string }, ctx: GraphQLContext) =>
            ctx.prisma.workout.findUnique({
                where: { id },
                include: { creator: true, blocks: { include: { exercises: true } }, likes: true },
            }),

        blocks: (_: any, __: any, ctx: GraphQLContext) => ctx.prisma.block.findMany(),
        exercises: (_: any, __: any, ctx: GraphQLContext) => ctx.prisma.exercise.findMany(),
        likes: (_: any, __: any, ctx: GraphQLContext) => ctx.prisma.like.findMany(),
    },
};
