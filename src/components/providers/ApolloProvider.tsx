// src/components/providers/ApolloProvider.tsx
'use client'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

// Crée une instance du client Apollo
function createApolloClient() {
    return new ApolloClient({
        // L'URL de votre API GraphQL que nous avons créée précédemment
        uri: '/api/graphql',
        // Un cache pour stocker les résultats des requêtes et améliorer les performances
        cache: new InMemoryCache(),
    });
}

export function AppApolloProvider({ children }: { children: React.ReactNode }) {
    const client = createApolloClient();
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
