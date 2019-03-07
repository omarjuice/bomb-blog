import React, { Component } from 'react';
import Modal from './Modal';
import GlobalStyles from './GlobalStyles';
import ErrorMessage from './ErrorMessage';
import Navbar from './Navbar';

class Header extends Component {
    state = {
        menu: false
    }
    render() {
        return (
            <div>
                <GlobalStyles />
                <Navbar client={this.props.client} />
                <Modal client={this.props.client} />
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
