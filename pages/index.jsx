import React, { Component } from 'react';

import { setSearch } from '../apollo/clientWrites';
import Home from '../components/home';
import { SEARCH_POSTS } from '../apollo/queries';
class Index extends Component {
    static async getInitialProps({ apolloClient }) {
        setSearch({ active: false })
        const recentPosts = await apolloClient.query({ query: SEARCH_POSTS, variables: { input: { limit: 10 } } })
        return {
            data: {
                recentPosts: recentPosts.data.posts
            }
        }
    }

    render() {
        return (
            <Home />
        )
    }
}


export default Index;
