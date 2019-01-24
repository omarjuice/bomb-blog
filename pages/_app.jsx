import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../apollo'

class MyApp extends App {
    render() {
        const { Component, pageProps, apollo } = this.props;
        return (
            <Container>
                <ApolloProvider client={apollo}>
                    <Component {...pageProps} client={apollo} />
                </ApolloProvider>
            </Container>
        );
    }
}

export default withApollo(MyApp)