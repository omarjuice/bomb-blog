import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { UNLIKE_POST } from '../../apollo/mutations';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { ILIKEPOST } from '../../apollo/queries';

const update = id => {
    return (proxy, { data: unlikePost }) => {
        if (!unlikePost) return;
        const data = proxy.readQuery({ query: ILIKEPOST, variables: { id } })
        data.post.iLike = false;
        data.post.numLikes--;
        proxy.writeQuery({ query: ILIKEPOST, variables: { id }, data })
    }
}

class UnlikePost extends Component {
    render() {
        return (
            <Mutation mutation={UNLIKE_POST} update={update(this.props.postId)}>
                {(unlikePost, { loading, error }) => {
                    if (loading) return <Loading color="primary" size={this.props.size} />
                    if (error) return <ErrorIcon color="primary" size={this.props.size} />
                    return (
                        <a onClick={async () => await unlikePost({ variables: { post_id: this.props.postId } })} className="has-text-primary">
                            <span className="icon">
                                <i className={`fas fa-heart fa-${this.props.size || 'lg'}`}>
                                </i>
                            </span>
                        </a>
                    )
                }}
            </Mutation>
        );
    }
}

export default UnlikePost;
