import fetch from 'node-fetch';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
import { handleErrors } from './handleErrors';

const defaults = {
    error: {
        __typename: 'Error',
        exists: false,
        global: true,
        code: '',
        message: ''
    },
    modal: {
        __typename: 'Modal',
        active: false,
        message: '',
        display: '',
        info: '',
        confirmation: null
    },
    search: {
        __typename: 'Search',
        input: '',
        options: '',
        active: false,
        addToInput: ''
    }
}
const cache = new InMemoryCache()

const stateLink = withClientState({ defaults, cache })

const client = new ApolloClient({
    link: ApolloLink.from([
        stateLink,
        onError((errors) => {
            handleErrors(cache, errors)
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