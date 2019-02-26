import React, { Component } from 'react';
import PostPage from '../components/posts';
import { setSearch } from '../apollo/clientWrites';
import { POST } from '../apollo/queries';

class Posts extends Component {
    static pageTransitionDelayEnter = true
    static async getInitialProps({ query: { id }, req, res, apolloClient }) {
        setSearch({ active: false })
        if (req && !id) {
            res.writeHead(302, { Location: `/` })
            res.end()
            return {}
        }
        id = Number(id)
        const { data } = await apolloClient.query({ query: POST, variables: { id } })

        return { data }
    }
    componentDidMount() {
        this.props.pageTransitionReadyToEnter()
    }
    render() {
        return (
            <PostPage post={this.props.data.post} />
        );
    }
}

export default Posts;
