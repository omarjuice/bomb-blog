import client from './client'
import { GET_SEARCH, GET_MODAL } from './queries';
export const renderModal = ({ active = false, message = '', confirmation = null, info = {}, display = '' }) => {
    if (info) {
        info = JSON.stringify(info)
    }
    client.writeData({
        data: {
            modal: { active, message, confirmation, info, display, __typename: 'Modal' }
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
                __typename: 'Modal',
                confirmation: null
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
export const createError = ({ code = '', exists = true, global = true, message = '' }) => {
    client.writeData({
        data: {
            error: {
                __typename: 'Error',
                exists,
                code,
                message,
                global
            }
        }
    })
}
export const setNotifications = (notifications = '') => {
    client.writeData({
        data: {
            notificationList: {
                __typename: 'NotificationList',
                notifications
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
export const setSearch = ({ input, options, active = true, addToInput = '' }) => {
    const data = client.readQuery({ query: GET_SEARCH })
    if (input !== undefined) data.search.input = input
    if (options !== undefined) data.search.options = options
    if (active !== undefined) data.search.active = active
    data.search.addToInput = addToInput
    client.writeQuery({ query: GET_SEARCH, data })
}