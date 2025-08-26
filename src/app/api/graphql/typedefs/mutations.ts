import { gql } from "@apollo/client";

export const mutationTypeDefs = gql`
  type Mutation {
    createWorkout(profileId: ID!, name: String!): Workout!
    claimWorkout(workoutId: ID!, profileId: ID!): Workout!
    duplicateWorkout(workoutId: ID!): Workout!
    toggleLikeWorkout(workoutId: ID!, profileId: ID!): ToggleLikeResponse!
    updateUserProfile(id: ID!, email: String): Profile!
    deleteWorkout(workoutId: ID!): Workout!
    updateWorkout(workoutId: ID!, name: String): Workout!
  }

  type ToggleLikeResponse {
    success: Boolean!
    message: String!
  }
`;
