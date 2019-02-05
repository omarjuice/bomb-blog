import React, { Component } from 'react';

class Search extends Component {
    static async getInitialProps({ query, apolloClient }) {
        console.log(query)
        return {}
    }
    render() {
        return (
            <div>
                Search
            </div>
        );
    }
}

export default Search;
