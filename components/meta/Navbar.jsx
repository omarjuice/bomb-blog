import React, { Component } from 'react';
import { Query } from 'react-apollo';
import Link from 'next/link';
import { shortenNumber } from '../../utils';
import BombSVG from '../svg/bomb';
import Authenticated from '../auth/Authenticated';
import SearchNav from './SearchNav';
import { GET_SEARCH, GET_NUM_NOTIFICATIONS, NOTIFICATIONS } from '../../apollo/queries';
import { renderModal, setNumNotifications } from '../../apollo/clientWrites';
import { navbarAnimations } from '../../animations';
import { SET_LAST_READ } from '../../apollo/mutations';

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
    deactivateMenu() {
        this.setState({
            menu: false
        })
    }
    toggleSearch = () => {
        const animation = this.state.searchNav ? navbarAnimations.slideOut('#search-nav') : navbarAnimations.slideIn('#search-nav')
        animation.finished.then(() => {
            this.setState({
                searchNav: !this.state.searchNav,
                menu: !this.state.searchNav ? false : this.state.menu
            })
        })
    }
    showNotifications = (data) => {
        return () => {
            renderModal({ active: true, display: 'Notifications' })
            data.numNotifications = 0
            this.props.client.writeQuery({ query: GET_NUM_NOTIFICATIONS, data })
            this.props.client.mutate({
                mutation: SET_LAST_READ,
                variables: { lastRead: Math.floor(Date.now() / 1000) },
                update: (proxy, { data: { setLastRead } }) => {
                    {
                        const data = proxy.readQuery({ query: NOTIFICATIONS })
                        data.notifications.lastRead = setLastRead
                        proxy.writeQuery({ query: NOTIFICATIONS, data })
                    }
                    {
                        const data = proxy.readQuery({ query: GET_NUM_NOTIFICATIONS })
                        data.numNotifications = 0
                        proxy.writeQuery({ query: GET_NUM_NOTIFICATIONS, data })
                    }
                }
            })
        }
    }
    render() {
        return (
            <div>
                <nav className="navbar is-fixed-top primary-navbar" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <Link href="/">
                            <a className="navbar-item">
                                <span className="icon is-large"><BombSVG lit={true} flare={true} /></span>
                                <img id="brand-img" src="/static/brand.svg" width="100" height="100" />
                            </a>
                        </Link>
                        <Link href="/posts/new" >
                            <a className="navbar-item" >
                                <span className="icon is-large"><i className="fas fa-pen fa-lg"></i></span>
                            </a>
                        </Link>
                        <a className={`navbar-item ${this.state.searchNav ? 'has-text-grey' : ''}`}
                            onClick={this.toggleSearch}>
                            <span className="icon is-large"><i className="fas fa-search fa-lg"></i></span>
                        </a>
                        <Query query={GET_NUM_NOTIFICATIONS}>
                            {({ data }) => {
                                return <a onClick={this.showNotifications(data)} className="navbar-item has-text-centered notifs">
                                    <span id="notification-icon"
                                        className={`icon is-large ${data && data.numNotifications > 0 ? 'has-text-info' : ''}`}>
                                        <i className="fas fa-globe "></i>
                                    </span>
                                    <span className={`has-text-weight-bold`}>{data && data.numNotifications ? shortenNumber(data.numNotifications) : '0'}</span>
                                </a>
                            }}
                        </Query>

                        <a role="button" className={`navbar-burger burger ${this.state.menu && 'is-active'}`}
                            onClick={() => this.setState({ menu: !this.state.menu, searchNav: !this.state.menu ? false : this.state.searchNav })}
                            aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>

                    <div className={`navbar-menu ${this.state.menu && 'is-active'}`}>
                        <div className="navbar-start">
                        </div>
                        <div className="navbar-end">
                            <Authenticated deactivateMenu={this.deactivateMenu.bind(this)} />
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
                        margin-left: -1rem;
                        margin-right: -1rem;
                    }
                    .navbar-brand{
                        margin-left: -1rem;
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
