import fetch from 'node-fetch';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
const defaults = {
    error: {
        __typename: 'Error',
        exists: false,
        code: '',
        message: ''
    },
    modal: {
        __typename: 'Modal',
        active: false,
        message: '',
        display: ''
    }
}
const cache = new InMemoryCache()

const stateLink = withClientState({ defaults, cache })

const client = new ApolloClient({
    link: ApolloLink.from([
        stateLink,
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                const [{ extensions: { code }, message }] = graphQLErrors;
                cache.writeData({
                    data: {
                        error: {
                            code, message, exists: true, __typename: 'Error'
                        }
                    }
                })
            }
            if (networkError) {
                cache.writeData({
                    data: {
                        error: {
                            code: 'SERVER', message: 'There was an error with the server', exists: true, __typename: 'Error'
                        }
                    }
                })
            };
        }),
        new HttpLink({
            uri: 'http://localhost:3000/graphql',
            credentials: 'same-origin',
            fetch
        }),

    ]),
    cache
})

client.onResetStore(stateLink.writeDefaults)

export default client