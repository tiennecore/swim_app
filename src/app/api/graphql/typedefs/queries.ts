import { gql } from "@apollo/client";

export const queryTypeDefs = gql`
   type Query {
    profiles: [Profile!]!
    profile(id: ID!): Profile
    workouts: [Workout!]!
    workout(id: ID!): Workout
    blocks: [Block!]!
    exercises: [Exercise!]!
    likes: [Like!]!
  }
`;
