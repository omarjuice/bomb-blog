export const handleErrors = (cache, { graphQLErrors, networkError, operation: { operationName } }) => {
    if (graphQLErrors) {
        const [{ extensions: { code }, message }] = graphQLErrors;
        console.log(graphQLErrors)
        const localOperationErrorMap = ['Register', 'Login']
        const global = !localOperationErrorMap.includes(operationName)
        cache.writeData({
            data: {
                error: {
                    code, message, global, exists: true, __typename: 'Error',
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
}