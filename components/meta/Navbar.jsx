import React, { Component } from 'react';
import BombSVG from '../svg/bomb';
import Authenticated from '../auth/Authenticated';
import SearchNav from './SearchNav';
import { Query } from 'react-apollo';
import { GET_SEARCH, NOTIFICATIONS, GET_NUM_NOTIFICATIONS } from '../../apollo/queries';
import Link from 'next/link';
import { renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';

class Navbar extends Component {
    state = {
        menu: false,
        searchNav: false
    }
    componentDidMount() {
        const nav = this
        const { client } = this.props
        this.watchSearch = client.watchQuery({ query: GET_SEARCH })
            .subscribe({
                next({ data }) {
                    nav.setState({
                        searchNav: data.search.active
                    })
                }
            })


    }
    render() {
        return (
            <div>
                <nav className="navbar is-fixed-top primary-navbar" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <Link href="/">
                            <a className="navbar-item">
                                <span className="icon is-large"><BombSVG lit={true} face={{ happy: true }} /></span>
                                <img id="brand-img" src="/static/brand.svg" width="100" height="100" />
                            </a>
                        </Link>
                        <Link href="/posts/new" >
                            <a className="navbar-item" >
                                <span className="icon is-large"><i className="fas fa-pen fa-lg"></i></span>
                            </a>
                        </Link>
                        <a className={`navbar-item ${this.state.searchNav ? 'has-text-info' : ''}`}
                            onClick={() => this.setState({ searchNav: !this.state.searchNav, menu: !this.state.searchNav ? false : this.state.menu })}>
                            <span className="icon is-large"><i className="fas fa-search fa-lg"></i></span>
                        </a>
                        <Query query={GET_NUM_NOTIFICATIONS}>
                            {({ data }) => {
                                return <a onClick={() => renderModal({ active: true, display: 'Notifications' })} className="navbar-item has-text-centered notifs">
                                    <span className={`icon is-large ${data && data.numNotifications > 0 ? 'has-text-info' : ''}`}><i className="fas fa-globe "></i></span>
                                    <span className={`has-text-weight-bold`}>{data && data.numNotifications ? shortenNumber(data.numNotifications) : '0'}</span>
                                </a>
                            }}
                        </Query>

                        <a role="button" className={`navbar-burger burger ${this.state.menu && 'is-active'}`} onClick={() => this.setState({ menu: !this.state.menu, searchNav: !this.state.menu ? false : this.state.searchNav })} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>

                    <div className={`navbar-menu ${this.state.menu && 'is-active'}`}>
                        <div className="navbar-start">
                        </div>
                        <div className="navbar-end">
                            <Authenticated />
                        </div>
                    </div>
                </nav>
                <Query query={GET_SEARCH}>
                    {({ data }) => {
                        return <SearchNav active={this.state.searchNav} search={data.search} />
                    }}
                </Query>
                <style jsx>{`
                    #brand-img{
                        margin-left: -1rem
                    }
                    .navbar-item{
                        margin-top: -1rem;
                        margin-bottom: -1rem
                    }
                    .notifs{
                        display: flex;
                        flex-direction: column;
                    }
                    .notifs .has-text-weight-bold{
                        margin: -1rem auto;  
                    }
                    `}</style>
            </div>
        );
    }
}

export default Navbar;
