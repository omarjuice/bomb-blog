import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { UNLIKE_POST } from '../../apollo/mutations';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { POST_LIKES, USER_POSTS, LIKES, CURRENT_USER, LIKERS } from '../../apollo/queries';
import BombSVG from '../svg/bomb';
import LikePost from './LikePost';

const update = (id, { page, userId }) => {
    return (proxy, { data: { unlikePost } }) => {
        if (!unlikePost) return;
        try {
            const currentUser = proxy.readQuery({ query: CURRENT_USER })
            const postLikers = proxy.readQuery({ query: LIKERS, variables: { id } })
            postLikers.post.likers = postLikers.post.likers.filter(liker => liker.id !== currentUser.user.id)
            proxy.writeQuery({ query: LIKERS, variables: { id }, data: postLikers })
        } catch (e) { }
        if (page && page === 'profile' && userId) {
            try {
                const userPosts = proxy.readQuery({ query: USER_POSTS, variables: { id: userId } })
                userPosts.user.posts = userPosts.user.posts.map(post => {
                    if (post.id === id) {
                        post.numLikes--;
                        post.iLike = false
                    }
                    return post
                })
                proxy.writeQuery({ query: USER_POSTS, variables: { id: userId }, data: userPosts })
            } catch (e) { }
            try {
                const userLikes = proxy.readQuery({ query: LIKES, variables: { id: userId } })
                userLikes.user.likedPosts = userLikes.user.likedPosts.map(post => {
                    if (post.id === id) {
                        post.numLikes--;
                        post.iLike = false;
                    }
                    return post
                })
                proxy.writeQuery({ query: LIKES, variables: { id: userId }, data: userLikes })
            } catch (e) { }
            try {
                const currentUser = proxy.readQuery({ query: CURRENT_USER })
                const currentUserLikes = proxy.readQuery({ query: LIKES, variables: { id: currentUser.user.id } })
                currentUserLikes.user.likedPosts = currentUserLikes.user.likedPosts.filter(post => post.id !== id)
                proxy.writeQuery({ query: LIKES, variables: { id: currentUser.user.id }, data: currentUserLikes })

            } catch (e) { }

            return
        }

        const data = proxy.readQuery({ query: POST_LIKES, variables: { id } })
        data.post.iLike = false;
        data.post.numLikes--;
        proxy.writeQuery({ query: POST_LIKES, variables: { id }, data })
    }
}

class UnlikePost extends Component {
    render() {
        return (
            <Mutation mutation={UNLIKE_POST} variables={{ post_id: this.props.postId }}
                update={update(this.props.postId, this.props.pageDetails || {})}
                optimisticResponse={{ __typename: "Mutation", unlikePost: true }}>
                {(unlikePost, { loading, error, data }) => {
                    if (error) return <ErrorIcon color="primary" size={this.props.size} />
                    if (data && data.unlikePost) {
                        return <LikePost size={this.props.size} postId={this.props.postId} />
                    }
                    return (
                        <a onClick={unlikePost} className="has-text-primary has-text-centered">
                            <span className="icon is-large">
                                <BombSVG lit={true} scale={this.props.scale || 1.2} />
                            </span>
                        </a>
                    )
                }}
            </Mutation>
        );
    }
}

export default UnlikePost;
