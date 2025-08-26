"use client";

import { ApolloClient, InMemoryCache, ApolloProvider as Provider } from "@apollo/client";
import { ReactNode } from "react";

const client = new ApolloClient({
    uri: "/api/graphql", // ton endpoint Next.js
    cache: new InMemoryCache(),
    credentials: "include", // utile si tu utilises Supabase avec cookies/session
});

export function ApolloProvider({ children }: { children: ReactNode }) {
    return <Provider client={client}>{children}</Provider>;
}
