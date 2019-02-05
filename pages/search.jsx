import React, { Component } from 'react';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL } from '../apollo/queries';
import SearchPage from '../components/search';

class Search extends Component {
    static getInitialProps({ query }) {
        const { input, options } = query
        return { input, options }
    }
    render() {
        return (
            <SearchPage input={this.props.input} options={this.props.options} />
        );
    }
}

export default Search;
