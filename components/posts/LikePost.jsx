import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import ErrorIcon from '../meta/ErrorIcon';
import BombSVG from '../svg/bomb';
import UnlikePost from './UnlikePost';
import { POST_LIKES, USER_POSTS, LIKES, CURRENT_USER, LIKERS } from '../../apollo/queries';
import { LIKE_POST } from '../../apollo/mutations';

const update = (id, { page, userId }) => {
    return (proxy, { data: likePost }) => {
        if (!likePost) return;
        try {
            const { user } = proxy.readQuery({ query: CURRENT_USER })
            const postLikers = proxy.readQuery({ query: LIKERS, variables: { id } })
            postLikers.post.likers.push({
                id: user.id,
                username: user.username,
                profile: {
                    photo_path: user.profile.photo_path,
                    __typename: "Profile"
                },
                isMe: true,
                imFollowing: false,
                followingMe: false,
                liked_at: String(Date.now()),
                __typename: "Liker"
            })
            proxy.writeQuery({ query: LIKERS, variables: { id }, data: postLikers })
        } catch (e) { }
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
        const data = proxy.readQuery({ query: POST_LIKES, variables: { id } })
        data.post.iLike = true;
        data.post.numLikes++;
        proxy.writeQuery({ query: POST_LIKES, variables: { id }, data })
    }
}

class LikePost extends Component {
    render() {
        return (
            <Mutation mutation={LIKE_POST} variables={{ post_id: this.props.postId }}
                update={update(this.props.postId, this.props.pageDetails || {})}
                optimisticResponse={{ __typename: "Mutation", likePost: true }}>
                {(likePost, { error, data }) => {
                    if (error) return <ErrorIcon color="primary" size={this.props.size} />
                    if (data && data.likePost) {
                        return <UnlikePost size={this.props.size} postId={this.props.postId} />
                    }
                    return (
                        <a onClick={likePost} className="has-text-primary has-text-centered">
                            <span className="icon is-large">
                                <BombSVG lit={false} scale={this.props.scale || 1.2} />
                            </span>
                            <style jsx>{`
                                .icon.is-large{
                                    position: relative;
                                    left: -0.5rem;
                                }
                                `}</style>
                        </a>
                    )
                }}
            </Mutation>
        );
    }
}

export default LikePost;
