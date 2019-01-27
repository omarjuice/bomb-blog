import withApollo from 'next-with-apollo'
import ApolloClient, { InMemoryCache } from 'apollo-boost'



export default withApollo(({ ctx, headers, initialState }) => (
    new ApolloClient({
        uri: 'http://localhost:3000/graphql',
        cache: new InMemoryCache().restore(initialState || {}),
        credentials: 'same-origin',
        onError: (errors) => {
            console.log(errors);
        },
    })
))