// src/components/providers/SupabaseProvider.tsx
'use client' // Ce composant doit s'exécuter côté client

import { createContext, useContext, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Définir le type pour notre contexte
type SupabaseContextType = {
    supabase: SupabaseClient
}

// Créer le contexte
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Créer le composant Provider
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    // Créer une seule instance du client et la garder en état
    const [supabase] = useState(() => createClient())

    return (
        <SupabaseContext.Provider value={{ supabase }}>
            {children}
        </SupabaseContext.Provider>
    )
}

// Créer un "hook" personnalisé pour utiliser facilement le contexte
export const useSupabase = () => {
    const context = useContext(SupabaseContext)
    if (context === undefined) {
        throw new Error('useSupabase doit être utilisé à l\'intérieur d\'un SupabaseProvider')
    }
    return context.supabase
}