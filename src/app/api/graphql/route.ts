import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { buildContext } from './context';
import type { NextRequest } from 'next/server';

const yoga = createYoga<{
    request: Request;
}>({
    schema,
    context: async ({ request }) => buildContext(request),
    graphqlEndpoint: '/api/graphql',
    graphiql: true,
});

export async function GET(request: NextRequest) {
    const response = await yoga.handleRequest(request);
    return new Response(response.body, {
        status: response.status,
        headers: response.headers,
    });
}

export async function POST(request: NextRequest) {
    const response = await yoga.handleRequest(request);
    return new Response(response.body, {
        status: response.status,
        headers: response.headers,
    });
}

export async function OPTIONS(request: NextRequest) {
    const response = await yoga.handleRequest(request);
    return new Response(response.body, {
        status: response.status,
        headers: response.headers,
    });
}
