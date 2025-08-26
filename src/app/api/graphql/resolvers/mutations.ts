import { GraphQLContext } from "../context";

export const mutationResolvers = {
    Mutation: {
        createWorkout: (_: any, { title, description }: any, ctx: GraphQLContext) =>
            ctx.prisma.workout.create({
                data: {
                    title,
                    description,
                    creatorId: ctx.userId!, // supposé fourni dans le contexte
                },
            }),

        claimWorkout: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            return ctx.prisma.workout.update({
                where: { id },
                data: { creatorId: ctx.userId! },
            });
        },

        duplicateWorkout: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            const workout = await ctx.prisma.workout.findUnique({
                where: { id },
                include: { blocks: { include: { exercises: true } } },
            });
            if (!workout) throw new Error("Workout not found");

            return ctx.prisma.workout.create({
                data: {
                    title: workout.title + " (copie)",
                    description: workout.description,
                    creatorId: ctx.userId!,
                    workoutType: workout.workoutType,
                    blocks: {
                        create: workout.blocks.map((block) => ({
                            order: block.order,
                            exercises: {
                                create: block.exercises.map((ex) => ({
                                    name: ex.name,
                                    type: ex.type,
                                    distance: ex.distance,
                                    equipment: ex.equipment,
                                })),
                            },
                        })),
                    },
                },
            });
        },

        toggleLikeWorkout: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            const existing = await ctx.prisma.like.findUnique({
                where: { userId_workoutId: { userId: ctx.userId!, workoutId: id } },
            });
            if (existing) {
                await ctx.prisma.like.delete({ where: { id: existing.id } });
                return ctx.prisma.workout.findUnique({ where: { id } });
            }
            await ctx.prisma.like.create({
                data: { userId: ctx.userId!, workoutId: id },
            });
            return ctx.prisma.workout.findUnique({ where: { id } });
        },

        updateUserProfile: (_: any, args: any, ctx: GraphQLContext) =>
            ctx.prisma.profile.update({
                where: { id: args.id },
                data: {
                    name: args.name ?? undefined,
                    customDrills: args.customDrills ?? undefined,
                    customAllures: args.customAllures ?? undefined,
                    poolSize: args.poolSize ?? undefined,
                    distanceDefault: args.distanceDefault ?? undefined,
                    defaultRepoTime: args.defaultRepoTime ?? undefined,
                },
            }),

        deleteWorkout: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            await ctx.prisma.workout.delete({ where: { id } });
            return true;
        },

        updateWorkout: (_: any, { id, title, description }: any, ctx: GraphQLContext) =>
            ctx.prisma.workout.update({
                where: { id },
                data: {
                    title: title ?? undefined,
                    description: description ?? undefined,
                },
            }),
    },
};
