import withApollo from 'next-with-apollo'
import ApolloClient, { InMemoryCache } from 'apollo-boost'
import { createHttpLink } from 'apollo-link-http';


export default withApollo(({ ctx, headers, initialState }) => (
    new ApolloClient({
        uri: 'http://localhost:3000/graphql',
        cache: new InMemoryCache().restore(initialState || {}),
        credentials: 'same-origin'
    })
))