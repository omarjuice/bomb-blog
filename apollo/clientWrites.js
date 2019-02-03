import client from './client'
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