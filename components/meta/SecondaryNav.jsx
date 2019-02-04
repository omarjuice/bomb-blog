import React, { Component } from 'react';

class SecondaryNav extends Component {
    state = {
        search: '',
        optionsActive: false,
        options: {

        }
    }
    render() {
        return (
            <nav className={`navbar is-fixed-top secondary-navbar ${this.props.active ? '' : 'is-hidden'}`} role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        <form action="" className="form">
                            <div className="field has-addons has-addons-right">
                                <p className="control">
                                    <span className="select">
                                        <select>
                                            <option>All</option>
                                            <option>Users</option>
                                            <option>Posts</option>
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <input className="input" type="text" placeholder="Search or #tags" />
                                </p>
                                <p className="control">
                                    <a className="button is-dark font-2">
                                        <i className="fas fa-search"></i>
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>

                </div>

            </nav >
        );
    }
}

export default SecondaryNav;
