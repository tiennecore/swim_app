'use client';

import { createContext, useContext, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const SupabaseContext = createContext<any>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createSupabaseBrowserClient());
    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
}

export const useSupabase = () => useContext(SupabaseContext);
