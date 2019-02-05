import React, { Component } from 'react';
import Head from 'next/head'
import Modal from './Modal';
import Authenticated from '../auth/Authenticated';
import GlobalStyles from './GlobalStyles';
import ErrorMessage from './ErrorMessage';
import BomgSVG from '../svg/bomb';
import Navbar from './Navbar';

class Header extends Component {
    state = {
        menu: false
    }

    render() {
        return (
            <div>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta charSet="utf-8" />
                    <link rel="stylesheet" href="https://jenil.github.io/bulmaswatch/simplex/bulmaswatch.min.css"></link>
                    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP"
                        crossOrigin="anonymous"></link>
                    <link href="https://fonts.googleapis.com/css?family=Baloo+Thambi|Coiny" rel="stylesheet"></link>

                    <title>Blog</title>
                    <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon/favicon-16x16.png" />
                    <link rel="manifest" href="/static/favicon/site.webmanifest" />
                    <link rel="mask-icon" href="/static/favicon/safari-pinned-tab.svg" color="#5bbad5" />
                    <meta name="msapplication-TileColor" content="#da532c" />

                    <meta name="theme-color" content="#ffffff"></meta>

                </Head>
                <GlobalStyles />
                <Navbar />
                <div id="buffer"></div>
                <Modal />
                <ErrorMessage globalScope={true} />
                <style jsx>{`
                    .navbar-menu{
                        position: relative;
                        z-index: 5
                    }
                    #buffer{
                        height: 45px;
                    }
                `}</style>
            </div>
        );
    }
}

export default Header;
