import React, { Component } from 'react';

import { setSearch } from '../apollo/clientWrites';
import Home from '../components/home';
import { SEARCH_POSTS, TRENDING } from '../apollo/queries';
class Index extends Component {
    static async getInitialProps({ apolloClient }) {
        setSearch({ active: false })
        const trending = await apolloClient.query({ query: TRENDING, variables: { input: { limit: 5, orderBy: "trending" } } })
        const recent = await apolloClient.query({ query: SEARCH_POSTS, variables: { input: { limit: 5, cursor: 0 } } })
        return {
            data: {
                trending: trending.data.posts,
                recent: recent.data.posts
            }
        }
    }

    render() {
        return (
            <Home data={this.props.data} />
        )
    }
}


export default Index;
