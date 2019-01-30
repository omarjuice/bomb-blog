import React, { Component } from 'react';
import Header from '../components/meta/Header';
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
                <Header />

                {/* <UsersList variables={{ limit: 100, orderBy: 'created_at', order: true, search: 'a' }} /> */}
                <PostPage id={this.props.id} />
            </>
        );
    }
}

export default Posts;
