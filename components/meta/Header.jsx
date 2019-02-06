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

                <GlobalStyles />
                <Navbar pathname={this.props.pathname} query={this.props.query} />
                <Modal />
                <ErrorMessage globalScope={true} />
                <style jsx>{`
                    .navbar-menu{
                        position: relative;
                        z-index: 5
                    }
                `}</style>
            </div>
        );
    }
}

export default Header;
