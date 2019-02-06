import React, { Component } from 'react';
import SearchPage from '../components/search';
import { setSearch } from '../apollo/clientWrites';

class Search extends Component {
    static getInitialProps({ query }) {
        setSearch(query)
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
