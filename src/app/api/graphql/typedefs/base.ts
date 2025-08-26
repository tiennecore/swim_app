import { gql } from "@apollo/client";

export const baseTypeDefs = gql`
  type Query
  type Mutation
  
  enum ExerciseType {
    ECHAUFFEMENT
    EXERCICE
    RECUPERATION
    RETOUR_AU_CALME
  }

  enum WorkoutType {
    ENDURANCE
    VITESSE_PUISSANCE
    TECHNIQUE
    RECUPERATION
    MIXTE
  }

  enum PoolSize {
    M25
    M50
  }

  type Profile {
    id: ID!
    name: String!
    customDrills: [String!]!
    customAllures: [String!]!
    poolSize: PoolSize!
    distanceDefault: Int!
    defaultTimeRepo: Int!

    # Champs calculés
    workoutCount: Int!
    likesCount: Int!
  }

  type Workout {
    id: ID!
    title: String!
    workoutType: WorkoutType!
    creator: Profile!

    # Champs calculés
    totalDistance: Int!
    usedEquipments: [String!]!
    isAddedByUser: Boolean!
  }

  type Block {
    id: ID!
    workout: Workout!
    exercises: [Exercise!]!
  }

  type Exercise {
    id: ID!
    name: String!
    type: ExerciseType!
    distance: Int
    equipment: String
  }

  type Like {
    id: ID!
    profile: Profile!
    workout: Workout!
  }
`;
export default baseTypeDefs;
