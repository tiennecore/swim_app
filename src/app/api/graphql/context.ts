// src/app/api/graphql/context.ts

export interface GraphQLContext {
    profileId?: string | null;
}

/**
 * Construit le contexte GraphQL (par ex : utilisateur courant)
 */
export async function buildContext(req: Request): Promise<GraphQLContext> {
    // Exemple basique : récupérer un header
    const userId = req.headers.get('x-user-id'); // ou Authorization si tu veux parser un JWT

    return {
        profileId: userId ?? null,
    };
}
