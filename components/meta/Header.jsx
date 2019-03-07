import React, { Component } from 'react';
import Modal from './Modal';
import GlobalStyles from './GlobalStyles';
import ErrorMessage from './ErrorMessage';
import Navbar from './Navbar';

class Header extends Component {
    state = {
        menu: false
    }
    componentDidMount() {
        let i = 0;
        setInterval(() => {
            let text;
            if (i === 0) {
                text = 'BOMB'
            } else if (i === 1) {
                text = 'A**'
            } else if (i === 2) {
                text = 'BLOG'
            }
            document.querySelector('title').innerText = text
            i++;
            if (i > 2) {
                i = 0
            }
        }, 2000)
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
