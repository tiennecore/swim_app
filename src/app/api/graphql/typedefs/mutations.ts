import { gql } from "@apollo/client";

export const mutationTypeDefs = gql`
  extend type Mutation {
    createWorkout(title: String!, description: String): Workout!
    claimWorkout(id: ID!): Workout!
    duplicateWorkout(id: ID!): Workout!
    toggleLikeWorkout(id: ID!): Workout!
    createProfile(id: ID!, email: String!): Profile!

    updateUserProfile(
      id: ID!
      name: String
      customDrills: [String!]
      customAllures: [String!]
      poolSize: PoolSize
      distanceDefault: Int
      defaultRepoTime: Int
    ): Profile!
    deleteWorkout(id: ID!): Boolean!
    updateWorkout(id: ID!, title: String, description: String): Workout!
  }
`;
export default mutationTypeDefs;
