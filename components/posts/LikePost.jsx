import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { ILIKEPOST, POST, USER_POSTS, LIKES, CURRENT_USER } from '../../apollo/queries';
import { LIKE_POST } from '../../apollo/mutations';

const update = (id, { page, userId }) => {
    return (proxy, { data: likePost }) => {
        if (!likePost) return;
        if (page && page === 'profile' && userId) {
            try {
                const userPosts = proxy.readQuery({ query: USER_POSTS, variables: { id: userId } })
                userPosts.user.posts = userPosts.user.posts.map(post => {
                    if (post.id === id) {
                        post.numLikes++;
                        post.iLike = true
                    }
                    return post
                })
                proxy.writeQuery({ query: USER_POSTS, variables: { id: userId }, data: userPosts })
            } catch (e) { }
            try {
                const userLikes = proxy.readQuery({ query: LIKES, variables: { id: userId } })
                userLikes.user.likedPosts = userLikes.user.likedPosts.map(post => {
                    if (post.id === id) {
                        post.numLikes++;
                        post.iLike = true
                    }
                    return post
                })
                proxy.writeQuery({ query: LIKES, variables: { id: userId }, data: userLikes })
            } catch (e) { }
            return
        }
        const data = proxy.readQuery({ query: ILIKEPOST, variables: { id } })
        data.post.iLike = true;
        data.post.numLikes++;
        proxy.writeQuery({ query: ILIKEPOST, variables: { id }, data })
    }
}

class LikePost extends Component {
    render() {
        return (
            <Mutation mutation={LIKE_POST} variables={{ post_id: this.props.postId }} update={update(this.props.postId, this.props.pageDetails || {})}>
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
