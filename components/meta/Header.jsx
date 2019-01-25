import React, { Component } from 'react';
import Head from 'next/head'
import Modal from './Modal';
import Authenticated from '../auth/Authenticated';

class Header extends Component {
    state = {
        modal: {
            active: false,
            display: ''
        },
        menu: false

    }
    renderModal = (display) => {
        return () => {
            this.setState({
                modal: {
                    active: !this.state.modal.active,
                    display
                }
            })
        }
    }
    render() {
        return (
            <>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta charSet="utf-8" />
                    <link rel="stylesheet" href="https://jenil.github.io/bulmaswatch/cerulean/bulmaswatch.min.css"></link>
                    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP"
                        crossorigin="anonymous"></link>
                    <title>Blog</title>
                </Head>
                <nav className="navbar" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item" href="https://bulma.io">
                            <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28" />
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
                            <Authenticated handleClick={this.renderModal} />
                        </div>
                    </div>
                </nav>
                <Modal display={this.state.modal.display} active={this.state.modal.active} toggle={() => this.setState({ modal: { active: false } })} />
            </>
        );
    }
}

export default Header;
