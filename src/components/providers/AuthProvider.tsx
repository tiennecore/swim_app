// src/components/providers/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import type { Session, User } from '@supabase/supabase-js'
import { gql, useMutation } from '@apollo/client'

// 1. Définir la mutation GraphQL pour réclamer un entraînement
const CLAIM_WORKOUT_MUTATION = gql`
  mutation ClaimWorkout($workoutId: ID!) {
    claimWorkout(workoutId: $workoutId) {
      id
      profileId
    }
  }
`

// Définir le type pour la valeur de notre contexte
type AuthContextType = {
    user: User | null
    session: Session | null
    isLoading: boolean
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Créer le composant Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = useSupabase()
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 2. Préparer la mutation avec le hook useMutation
    const [claimWorkout] = useMutation(CLAIM_WORKOUT_MUTATION, {
        onCompleted: (data) => {
            console.log("Entraînement réclamé avec succès !", data);
            // On nettoie le localStorage une fois l'opération réussie
            localStorage.removeItem('anonymousWorkoutId');
        },
        onError: (error) => {
            console.error("Erreur lors de la réclamation de l'entraînement:", error.message);
            // On nettoie même en cas d'erreur (ex: déjà réclamé, non trouvé)
            localStorage.removeItem('anonymousWorkoutId');
        }
    });

    useEffect(() => {
        setIsLoading(true)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setIsLoading(false)

                // 3. Logique de réclamation
                // Si l'événement est une connexion réussie ('SIGNED_IN')...
                if (event === 'SIGNED_IN') {
                    // ...on vérifie si un ID d'entraînement anonyme existe dans le localStorage.
                    const anonymousWorkoutId = localStorage.getItem('anonymousWorkoutId');
                    if (anonymousWorkoutId) {
                        console.log(`Connexion détectée. Tentative de réclamation pour l'entraînement ID: ${anonymousWorkoutId}`);
                        // Si oui, on appelle la mutation GraphQL pour l'associer à l'utilisateur.
                        claimWorkout({ variables: { workoutId: anonymousWorkoutId } });
                    }
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, claimWorkout]) // Ajouter claimWorkout aux dépendances

    const value = {
        user,
        session,
        isLoading,
    }

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

// Créer un "hook" personnalisé pour accéder facilement au contexte
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
    }
    return context
}
