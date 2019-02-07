import client from './client'
import { GET_SEARCH } from './queries';
export const showModal = (modal) => {
    if (modal.info) {
        modal.info = JSON.stringify(modal.info)
    }
    client.writeData({
        data: {
            modal: { ...modal, __typename: 'Modal' }
        }
    })
}
export const hideModal = () => {
    client.writeData({
        data: {
            modal: {
                active: false,
                message: '',
                display: '',
                info: '',
                __typename: 'Modal'
            }
        }
    })
}
export const clearError = () => {
    client.writeData({
        data: {
            error: {
                __typename: 'Error',
                exists: false,
                code: '',
                message: '',
                global: true
            }
        }
    })
}
export const clearAuth = () => {
    client.writeData({
        data: {
            authenticated: false
        }
    })
}
export const setSearch = ({ input, options, active, addToInput }) => {

    const data = client.readQuery({ query: GET_SEARCH })
    if (input !== undefined) data.search.input = input
    if (options !== undefined) data.search.options = options
    if (active !== undefined) data.search.active = active
    if (addToInput !== undefined) {
        data.search.addToInput = addToInput
    } else {
        data.search.addToInput = ''
    }
    console.log(data)
    client.writeQuery({ query: GET_SEARCH, data })
}