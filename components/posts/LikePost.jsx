import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { ILIKEPOST, POST } from '../../apollo/queries';
import { LIKE_POST } from '../../apollo/mutations';

const update = id => {
    return (proxy, { data: likePost }) => {
        if (!likePost) return;
        const data = proxy.readQuery({ query: ILIKEPOST, variables: { id } })
        data.post.iLike = true;
        data.post.numLikes++;
        proxy.writeQuery({ query: ILIKEPOST, variables: { id }, data })
    }
}

class LikePost extends Component {
    render() {
        return (
            <Mutation mutation={LIKE_POST} variables={{ post_id: this.props.postId }} update={update(this.props.postId)}>
                {(likePost, { loading, error }) => {
                    if (loading) return <Loading color="primary" size={this.props.size} />
                    if (error) return <ErrorIcon color="primary" size={this.props.size} />
                    return (
                        <a onClick={likePost} className="has-text-primary">
                            <span className="icon">
                                <i className={`far fa-heart fa-${this.props.size || 'lg'}`}>
                                </i>
                            </span>
                        </a>
                    )

                }}
            </Mutation>
        );
    }
}

export default LikePost;
