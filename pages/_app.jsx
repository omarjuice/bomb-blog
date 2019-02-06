import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../apollo'
import Header from '../components/meta/Header';

class MyApp extends App {
    static getInitialProps({ router }) {
        const { pathname, query } = router
        return { pathname, query }
    }
    render() {
        const { Component, pageProps, apollo, pathname, query } = this.props;
        return (
            <Container>
                <ApolloProvider client={apollo}>
                    <Header pathname={pathname} query={query} />
                    <Component {...pageProps} client={apollo} query={query} />
                </ApolloProvider>
            </Container>
        );
    }
}

export default withApollo(MyApp)