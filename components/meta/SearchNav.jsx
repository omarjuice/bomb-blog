import React, { Component } from 'react';
import Link from 'next/link';
import { getMatches } from '../../utils';

class SearchNav extends Component {
    state = {
        input: '',
        optionsActive: false,
        options: 'all'
    }
    parseInput() {
        const { input, options } = this.state;
        return { input, options }
    }
    onSubmit = e => {
        // "http://localhost:3000/search?input=%23beautiful%20%23cool&options=all"
        const URI = `/search?input=${encodeURIComponent(this.state.input)}&options=${encodeURIComponent(this.state.options)}`
        console.log(URI);
        return URI
    }
    render() {
        return (
            <nav className={`navbar is-fixed-top secondary-navbar ${this.props.active ? '' : 'is-hidden'}`} role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        <form action={this.onSubmit()} className="form" method="GET">
                            <div className="field has-addons has-addons-right">
                                <p className="control">
                                    <span className="select">
                                        <select onChange={(e) => this.setState({ options: e.target.value })} value={this.state.options}>
                                            <option>all</option>
                                            <option>users</option>
                                            <option>posts</option>
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <input className="input" type="text" placeholder="Search or #tags" onChange={e => this.setState({ input: e.target.value })} value={this.state.input} />
                                </p>
                                <p className="control">
                                    <Link href={{ pathname: '/search', query: { ...this.parseInput() } }}>
                                        <a className="button is-dark font-2">
                                            <i className="fas fa-search"></i>
                                        </a>
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                </div>

            </nav >
        );
    }
}

export default SearchNav;
