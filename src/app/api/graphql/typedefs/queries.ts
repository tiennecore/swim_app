import { gql } from "@apollo/client";

export const queryTypeDefs = gql`
  type Query {
    users: [User!]!
    workouts: [Workout!]!
    blocks: [Block!]!
    exercises: [Exercise!]!
    likes: [Like!]!
    profiles: [Profile!]!
  }
`;
