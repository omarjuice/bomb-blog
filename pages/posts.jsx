import React, { Component } from 'react';
import PostPage from '../components/posts';
import { setSearch } from '../apollo/clientWrites';

class Posts extends Component {
    static async getInitialProps({ query: { id }, req, res }) {
        setSearch({ active: false })
        if (req && !id) {
            res.writeHead(302, { Location: `/` })
            res.end()
            return {}
        }

        return { id }
    }
    render() {
        return (
            <>
                <PostPage id={this.props.id} />
            </>
        );
    }
}

export default Posts;
