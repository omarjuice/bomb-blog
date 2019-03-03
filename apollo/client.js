import fetch from 'node-fetch';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink, } from 'apollo-upload-client'
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
import { handleErrors } from './handleErrors';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const wsLink = process.browser ? new SubscriptionClient('ws://localhost:3000/graphql', {
    reconnect: true
}, WebSocket) : null

const httpLink = createUploadLink({
    uri: `http://localhost:3000/graphql`,
    fetch,
    credentials: 'same-origin',
});

const link = process.browser ? split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
) : httpLink;
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
    },
    numNotifications: 0
}
const cache = new InMemoryCache()

const stateLink = withClientState({ defaults, cache })

const client = new ApolloClient({
    link: ApolloLink.from([
        stateLink,
        onError((errors) => {
            handleErrors(cache, errors)
        }),
        link
    ]),
    cache
})

client.onResetStore(stateLink.writeDefaults)

export default client