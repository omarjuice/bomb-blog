import React, { Component } from 'react';

class Footer extends Component {
    state = {
        active: false
    }

    render() {
        return (
            <div>
                <nav className={`navbar is-fixed-bottom is-dark ${!this.state.active && 'is-hidden'}`}>
                    <div className="navbar-end">
                        <a className="navbar-item" href="https://omarjuice.github.io" target="_blank">
                            <img src="/static/OJLOGOsquare.png" />
                        </a>
                        <p className="navbar-item has-text-primary">
                            |
                        </p>
                        <p className="navbar-item font-1">
                            {new Date().getFullYear()}
                        </p>
                        <p className="navbar-item has-text-primary">
                            |
                        </p>
                        <a className="navbar-item" href="https://github.com/OmarJuice/bomb-blog" target="_blank" >
                            <span className="icon">
                                <i className="fab fa-github fa-lg"></i>
                            </span>
                        </a>
                    </div>

                </nav>
                <a onClick={() => this.setState({ active: !this.state.active })} className={`button is-text ${this.state.active ? 'is-white' : ''}`}>
                    <span className="icon">
                        <i className="fas fa-info"></i>
                    </span>
                </a>
                <style jsx>{`   
                    .button{
                        position: fixed;
                        bottom: .5rem;
                        left: 1rem;
                        z-index: 10
                    }
                    .navbar{
                        position: absolute;
                        bottom: 0;
                        z-index: 9 !important;
                    }


                `}</style>
            </div>
        );
    }
}

export default Footer;
