import React, { Component } from 'react';
import BomgSVG from '../svg/bomb';
import Authenticated from '../auth/Authenticated';
import SecondaryNav from './SecondaryNav';

class Navbar extends Component {
    state = {
        menu: false,
        secondaryNav: false
    }
    render() {


        return (
            <div>
                <nav className="navbar is-fixed-top primary-navbar" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item" href="/">
                            <span className="icon is-large"><BomgSVG lit={true} /></span>
                            <img id="brand-img" src="/static/brand.svg" width="150" height="100" />
                        </a>
                        <a className="navbar-item">
                            <span className="icon is-large"><i class="fas fa-home fa-lg"></i></span>
                        </a>
                        <a className={`navbar-item ${this.state.secondaryNav ? 'has-text-info' : ''}`}
                            onClick={() => this.setState({ secondaryNav: !this.state.secondaryNav })}>
                            <span className="icon is-large"><i class="fas fa-search fa-lg"></i></span>
                        </a>

                        <a role="button" className={`navbar-burger burger ${this.state.menu && 'is-active'}`} onClick={() => this.setState({ menu: !this.state.menu })} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div id="navbarBasicExample" className={`navbar-menu ${this.state.menu && 'is-active'}`}>
                        <div className="navbar-start">
                        </div>

                        <div className="navbar-end">
                            <Authenticated />
                        </div>
                    </div>
                </nav>
                <SecondaryNav active={this.state.secondaryNav} />
            </div>
        );
    }
}

export default Navbar;