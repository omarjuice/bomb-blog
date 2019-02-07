import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../apollo'
import Header from '../components/meta/Header';

class MyApp extends App {
    static async getInitialProps({ Component, ctx }) {
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return { pageProps }
    }
    render() {
        const { Component, pageProps, apollo } = this.props;

        return (
            <Container>
                <ApolloProvider client={apollo}>
                    <Header client={apollo} />
                    <Component {...pageProps} client={apollo} />
                </ApolloProvider>
            </Container>
        );
    }
}

export default withApollo(MyApp)