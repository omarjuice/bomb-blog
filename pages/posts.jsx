import React, { Component } from 'react';
import PostPage from '../components/posts';

class Posts extends Component {
    static async getInitialProps({ query: { id }, req, res }) {
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
