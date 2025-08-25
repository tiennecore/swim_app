// src/graphql/resolvers/Query.ts
import prisma from '@/lib/prisma';
import { createWorkoutSignature } from '../utils';

export const Query = {
    getWorkout: async (_: any, { id }: { id: string }) => {
        return await prisma.workout.findUnique({
            where: { id },
            include: {
                blocks: { include: { exercises: true } },
            },
        });
    },
    getUserProfile: async (_: any, __: any, context: any) => {
        const { user } = context;
        if (!user) return null;

        return await prisma.profiles.findUnique({
            where: { id: user.id },
            include: {
                customEquipments: true,
                customBreathingRhythms: true,
            },
        });
    },
    getMyWorkouts: async (_: any, __: any, context: any) => {
        const { user } = context;
        if (!user) return [];
        return await prisma.workout.findMany({
            where: { profileId: user.id },
            include: { blocks: { include: { exercises: true } } },
            orderBy: { name: 'asc' }
        });
    },
    getAllWorkouts: async (_: any, __: any, context: any) => {
        const { user } = context;

        const [allWorkouts, allLikes] = await Promise.all([
            prisma.workout.findMany({
                include: { blocks: { include: { exercises: true } } },
                orderBy: { name: 'asc' }
            }),
            prisma.like.findMany(),
        ]);

        const userWorkouts = user ? allWorkouts.filter(w => w.profileId === user.id) : [];
        const userWorkoutSignatures = new Set(userWorkouts.map(w => createWorkoutSignature(w)));

        const likesBySignature = new Map<string, number>();
        const userLikesBySignature = new Set<string>();
        allLikes.forEach(like => {
            likesBySignature.set(like.workoutSignature, (likesBySignature.get(like.workoutSignature) || 0) + 1);
            if (user && like.profileId === user.id) {
                userLikesBySignature.add(like.workoutSignature);
            }
        });

        const uniqueWorkouts = new Map();
        allWorkouts.forEach(workout => {
            const signature = createWorkoutSignature(workout);
            if (!uniqueWorkouts.has(signature)) {
                const workoutWithComputedFields = {
                    ...workout,
                    isAlreadyAdded: userWorkoutSignatures.has(signature),
                    likeCount: likesBySignature.get(signature) || 0,
                    isLikedByUser: user ? userLikesBySignature.has(signature) : false
                };
                uniqueWorkouts.set(signature, workoutWithComputedFields);
            }
        });

        return Array.from(uniqueWorkouts.values());
    }
};
