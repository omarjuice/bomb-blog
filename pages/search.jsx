import React, { Component } from 'react';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL } from '../apollo/queries';
import SearchPage from '../components/search';

class Search extends Component {
    render() {
        const { input, options } = this.props.query
        return (
            <SearchPage input={input} options={options} />
        );
    }
}

export default Search;
