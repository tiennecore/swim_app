import { queryResolvers } from "./queries";
import { mutationResolvers } from "./mutations";
import { extensionResolvers } from "./extensions";

export const resolvers = [
    queryResolvers,
    mutationResolvers,
    extensionResolvers,
];
