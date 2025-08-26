import { queryResolvers } from "./queries";
import { mutationResolvers } from "./mutations";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const resolvers = {
    ...queryResolvers,
    ...mutationResolvers,

    User: {
        profile: (parent: any) => prisma.profile.findUnique({ where: { id: parent.id } }),
    },

    Profile: {
        user: (parent: any) => prisma.user.findUnique({ where: { id: parent.id } }),
        workouts: (parent: any) => prisma.workout.findMany({ where: { profileId: parent.id } }),
        likes: (parent: any) => prisma.like.findMany({ where: { profileId: parent.id } }),
    },

    Workout: {
        profile: (parent: any) => prisma.profile.findUnique({ where: { id: parent.profileId } }),
        blocks: (parent: any) => prisma.block.findMany({ where: { workoutId: parent.id } }),
        likes: (parent: any) => prisma.like.findMany({ where: { workoutId: parent.id } }),
    },

    Block: {
        workout: (parent: any) => prisma.workout.findUnique({ where: { id: parent.workoutId } }),
        exercises: (parent: any) => prisma.exercise.findMany({ where: { blockId: parent.id } }),
    },

    Exercise: {
        block: (parent: any) => prisma.block.findUnique({ where: { id: parent.blockId } }),
    },

    Like: {
        profile: (parent: any) => prisma.profile.findUnique({ where: { id: parent.profileId } }),
        workout: (parent: any) => prisma.workout.findUnique({ where: { id: parent.workoutId } }),
    },
};
