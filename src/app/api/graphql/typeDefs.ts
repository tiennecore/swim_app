// src/graphql/typeDefs.ts

export const typeDefs = `#graphql
  # --- Enums (listes de choix) ---
  enum ExerciseCategory { ECHAUFFEMENT, EXERCICE, RECUPERATION, FIN_DE_SEANCE }
  enum ExerciseUnit { DISTANCE, TEMPS }
  enum StrokeType { NAGE_LIBRE, BRASSE, CRAWL, DOS_CRAWLE, PAPILLON, QUATRE_NAGES, MIX, DRILLS, NON_DEFINI }
  enum Intensity { APPLIQUE, LENT, ENDURANCE, RAPIDE, SPRINT, PROGRESSIF, DEGRESSIF }
  enum WorkoutType { ENDURANCE, VITESSE_PUISSANCE, TECHNIQUE, RECUPERATION, MIXTE }

  # --- Types de données ---
  type CustomEquipment { id: ID!, name: String! }
  type CustomBreathingRhythm { id: ID!, value: String! }
  type UserProfile {
    id: ID!
    name: String
    defaultRestTime: Int!
    defaultDistance: Int!
    defaultPoolLength: Int!
    customEquipments: [CustomEquipment!]!
    customBreathingRhythms: [CustomBreathingRhythm!]!
  }
  type Exercise {
    id: ID!
    intensity: Intensity
    equipment: [String!]!
    breathingRhythm: Int
    duration: Int
    category: ExerciseCategory!
    unit: ExerciseUnit!
    value: Int!
    stroke: StrokeType!
    drill: String
    details: String!
  }
  type Block {
    id: ID!
    name: String!
    repetitions: Int!
    exercises: [Exercise!]!
  }
  type Workout {
    id: ID!
    name: String!
    workoutType: WorkoutType
    creatorName: String
    profileId: String
    blocks: [Block!]!
    totalDistance: Int!
    likeCount: Int!
    isLikedByUser(anonymousId: String): Boolean!
    isAlreadyAdded: Boolean!
  }

  # --- Requêtes (pour récupérer des données) ---
  type Query {
    getWorkout(id: ID!): Workout
    getUserProfile: UserProfile
    getMyWorkouts: [Workout!]!
    getAllWorkouts: [Workout!]!
  }

  # --- Inputs (pour envoyer des données) ---
  input UpdateProfileInput {
    name: String
    defaultPoolLength: Int
    defaultDistance: Int
    defaultRestTime: Int
  }
  input ExerciseInput {
    intensity: Intensity
    equipment: [String!]!
    breathingRhythm: Int
    duration: Int
    category: ExerciseCategory!
    unit: ExerciseUnit!
    value: Int!
    stroke: StrokeType!
    drill: String
    details: String!
  }
  input BlockInput {
    name: String!
    repetitions: Int!
    exercises: [ExerciseInput!]!
  }
  
  input AIWorkoutPreferencesInput {
      objective: String!
      level: String!
      targetType: String! # Soit "DURATION", soit "DISTANCE"
      targetValue: Int!   # La valeur en minutes ou en mètres
      equipment: [String!]!
  }

  # --- Mutations (pour modifier des données) ---
  type Mutation {
    createWorkout(name: String!, blocks: [BlockInput!]!, workoutType: WorkoutType): Workout
    claimWorkout(workoutId: ID!): Workout
    duplicateWorkout(workoutId: ID!): Workout
    toggleLikeWorkout(workoutId: ID!, anonymousId: String): Workout
    updateUserProfile(input: UpdateProfileInput!): UserProfile
    deleteWorkout(workoutId: ID!): Boolean
    generateWorkoutFromAI(input: AIWorkoutPreferencesInput!): Workout
    updateWorkout(workoutId: ID!, name: String!, blocks: [BlockInput!]!, workoutType: WorkoutType): Workout
  }
`;
