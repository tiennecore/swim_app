// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { typeDefs } from '@/app/api/graphql/typeDefs';
import { resolvers } from '@/app/api/graphql/resolvers';

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          set: async (name: string, value: string, options: CookieOptions) => {
            const cookieStore = await cookies();
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
            }
          },
          remove: async (name: string, options: CookieOptions) => {
            const cookieStore = await cookies();
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
            }
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return { user };
  }
});

export { handler as GET, handler as POST };
