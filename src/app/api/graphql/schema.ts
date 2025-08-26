import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./typedefs"; // fusion des types (index.ts dans typedefs)
import { resolvers } from "./resolvers"; // fusion des resolvers (index.ts dans resolvers)

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
