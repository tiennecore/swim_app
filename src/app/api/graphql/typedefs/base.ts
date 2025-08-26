import { gql } from "@apollo/client";

export const baseTypeDefs = gql`
  type User {
    id: ID!
    email: String
    profile: Profile
  }

  type Profile {
    id: ID!
    name: String!
    user: User
    workouts: [Workout!]!
    likes: [Like!]!
  }
enum WorkoutType {
    ENDURANCE
    VITESSE_PUISSANCE
    TECHNIQUE
    RECUPERATION
    MIXTE
  }

  type Workout {
    id: ID!
    profile: Profile
    name: String!
    description: String
    totalDistance: Int!
    creatorName: String!
    materials: [String!]!
    isAddedByUser: Boolean!
    type: WorkoutType!
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
    equipment: [String!]
    type: ExerciseType!
    details: String
    createdAt: String!
    updatedAt: String!
  }

  enum ExerciseType {
    ECHAUFFEMENT
    EXERCICE
    RECUPERATION
    RETOUR_AU_CALME
  }

  type Like {
    id: ID!
    profile: Profile
    workout: Workout
    createdAt: String!
  }
`;