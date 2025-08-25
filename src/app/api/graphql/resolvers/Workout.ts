// src/graphql/resolvers/Workout.ts
import prisma from '@/lib/prisma';
import { createWorkoutSignature } from '../utils';

export const Workout = {
    totalDistance: (parent: any) => {
        if (!parent.blocks) return 0;
        return parent.blocks.reduce((total: number, block: any) => {
            const blockDistance = block.exercises.reduce((subTotal: number, exercise: any) => {
                if (exercise.unit === 'DISTANCE') {
                    return subTotal + exercise.value;
                }
                return subTotal;
            }, 0);
            return total + (blockDistance * block.repetitions);
        }, 0);
    },
    likeCount: async (parent: any) => {
        if (parent.likeCount !== undefined) return parent.likeCount;

        if (!parent.blocks || !parent.blocks[0]?.exercises) {
            const fullWorkout = await prisma.workout.findUnique({
                where: { id: parent.id },
                include: { blocks: { include: { exercises: true } } }
            });
            if (!fullWorkout) return 0;
            parent = fullWorkout;
        }

        const signature = createWorkoutSignature(parent);
        return await prisma.like.count({
            where: { workoutSignature: signature },
        });
    },
    isLikedByUser: async (parent: any, { anonymousId }: { anonymousId?: string }, context: any) => {
        const { user } = context;
        if (parent.isLikedByUser !== undefined) return parent.isLikedByUser;

        if (!parent.blocks || !parent.blocks[0]?.exercises) {
            const fullWorkout = await prisma.workout.findUnique({
                where: { id: parent.id },
                include: { blocks: { include: { exercises: true } } }
            });
            if (!fullWorkout) return false;
            parent = fullWorkout;
        }

        const signature = createWorkoutSignature(parent);

        if (user) {
            const like = await prisma.like.findUnique({ where: { profileId_workoutSignature: { profileId: user.id, workoutSignature: signature } } });
            return !!like;
        }
        if (anonymousId) {
            const like = await prisma.like.findUnique({ where: { anonymousId_workoutSignature: { anonymousId, workoutSignature: signature } } });
            return !!like;
        }
        return false;
    }
};
