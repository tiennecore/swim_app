import { gql } from "@apollo/client";

export const baseTypeDefs = gql`
  type User {
    id: ID!
    email: String
    profile: Profile
  }

  type Profile {
    id: ID!
    user: User
    workouts: [Workout!]!
    likes: [Like!]!
  }

  type Workout {
    id: ID!
    profile: Profile
    name: String!
    blocks: [Block!]!
    likes: [Like!]!
    createdAt: String!
    updatedAt: String!
  }

  type Block {
    id: ID!
    workout: Workout!
    name: String!
    exercises: [Exercise!]!
    createdAt: String!
    updatedAt: String!
  }

  type Exercise {
    id: ID!
    block: Block!
    category: String!
    value: Int
    unit: String
    repetitions: Int
    duration: Int
    drill: String
    equipment: [String!]   # ✅ Prisma : String[]
    details: String
    createdAt: String!
    updatedAt: String!
  }

  type Like {
    id: ID!
    profile: Profile
    workout: Workout
    createdAt: String!
  }
`;