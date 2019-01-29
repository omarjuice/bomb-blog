import client from './client'
export const showModal = (modal) => {
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
                message: ''
            }
        }
    })
}