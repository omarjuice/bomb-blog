import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import { PageTransition } from 'next-page-transitions'
import withApollo from '../apollo'
import Header from '../components/meta/Header';
import Loading from '../components/meta/Loading';
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
                    <PageTransition timeout={300} classNames="page-transition">
                        <Component {...pageProps} client={apollo} />
                    </PageTransition>
                </ApolloProvider>
                <style jsx global>{`
                .page-transition-enter {
                    opacity: 0;
                }
                .page-transition-enter-active {
                    opacity: 1;
                    transition: opacity 300ms;
                }
                .page-transition-exit {
                    opacity: 1;
                }
                .page-transition-exit-active {
                    opacity: 0;
                    transition: opacity 300ms;
                }
                    `}</style>
            </Container>
        );
    }
}

export default withApollo(MyApp)