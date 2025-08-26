import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { schema } from "@/app/api/graphql/schema"; // <- ton schema fusionné
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new ApolloServer({
    schema,
});

export const GET = startServerAndCreateNextHandler(server, {
    context: async (req) => {
        // ⚡ Tu peux enrichir le contexte (auth utilisateur, etc.)
        // Exemple si tu utilises Supabase Auth :
        // const user = await getUserFromAuth(req);
        return { prisma /*, user*/ };
    },
});

export const POST = GET;
