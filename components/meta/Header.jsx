import React, { Component } from 'react';
import Head from 'next/head'
import Modal from './Modal';
import Authenticated from '../auth/Authenticated';
import GlobalStyles from './GlobalStyles';
import ErrorMessage from './ErrorMessage';
import BomgSVG from '../svg/bomb';

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
                </Head>
                <GlobalStyles />
                <nav className="navbar" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item" href="/">
                            <span className="icon is-large"><BomgSVG lit={true} /></span>
                            <img id="brand-img" src="/static/brand.svg" width="150" height="100" />
                        </a>
                        <a role="button" className={`navbar-burger burger ${this.state.menu && 'is-active'}`} onClick={() => this.setState({ menu: !this.state.menu })} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div id="navbarBasicExample" className={`navbar-menu ${this.state.menu && 'is-active'}`}>
                        <div className="navbar-start">
                            <a className="navbar-item">
                                Home
                            </a>

                            <a className="navbar-item">
                                Documentation
                            </a>

                            <div className="navbar-item has-dropdown is-hoverable">
                                <a className="navbar-link">
                                    More
                                </a>

                                <div className="navbar-dropdown">
                                    <a className="navbar-item">
                                        About
                                    </a>
                                    <a className="navbar-item">
                                        Jobs
                                    </a>
                                    <a className="navbar-item">
                                        Contact
                                    </a>
                                    <hr className="navbar-divider" />
                                    <a className="navbar-item">
                                        Report an issue
                                    </a>
                                </div>
                            </div>

                        </div>

                        <div className="navbar-end">
                            <Authenticated />
                        </div>
                    </div>
                </nav>
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
