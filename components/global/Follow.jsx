import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Unfollow from './UnFollow';
import { FOLLOW } from '../../apollo/mutations';
import { FOLLOWERS, FOLLOWING, USER_PROFILE, CURRENT_USER } from '../../apollo/queries';
import ErrorIcon from '../meta/ErrorIcon';

const update = (id, bool) => {
    return (proxy, { data: { createFollow } }) => {
        if (!bool || !createFollow) return;
        const currentUser = proxy.readQuery({ query: CURRENT_USER, variables: { id } })
        const followedUser = proxy.readQuery({ query: USER_PROFILE, variables: { id } })
        let followerData;
        try {
            followerData = proxy.readQuery({ query: FOLLOWERS, variables: { id } })
            followerData.user.followers.push({
                id: currentUser.user.id,
                username: currentUser.user.username,
                profile: {
                    photo_path: currentUser.user.profile.photo_path,
                    __typename: 'Profile'
                },
                followingMe: false,
                imFollowing: false,
                isMe: true,
                followed_at: String(Date.now()),
                __typename: 'User'
            })
            proxy.writeQuery({ query: FOLLOWERS, variable: { id }, data: followerData })
        } catch (e) { }
        let followingData;
        try {
            followingData = proxy.readQuery({ query: FOLLOWING, variables: { id: currentUser.user.id } })
            followingData.user.following.push({
                id: followedUser.user.id,
                username: followedUser.user.username,
                profile: {
                    photo_path: followedUser.user.profile.photo_path,
                    __typename: 'Profile'
                },
                followingMe: followedUser.user.followingMe,
                imFollowing: true,
                isMe: false,
                followed_at: String(Date.now()),
                __typename: 'User'
            })
            proxy.writeQuery({ query: FOLLOWING, variables: { id: currentUser.user.id }, data: followingData })
        } catch (e) { }
        followedUser.user.imFollowing = true;
        followedUser.user.numFollowers++;
        proxy.writeQuery({ query: USER_PROFILE, variables: { id }, data: followedUser })
    }
}

class Follow extends Component {

    render() {
        const { userId } = this.props
        const size = this.props.size === 'large' ? 'fa-3x' : 'fa-lg'
        return <Mutation mutation={FOLLOW} variables={{ user_id: userId }}
            update={update(userId, this.props.page === 'profile')}
            optimisticResponse={{ __typename: "Mutation", createFollow: true }}>
            {(createFollow, { error, data }) => {
                if (error) return <ErrorIcon size={size} color="link" />
                if (!data || (data && !data.createFollow) || this.props.page === 'profile') return (
                    <a onClick={createFollow}>
                        <span className="icon hover-icon">
                            <i className={`fas ${size} fa-user-plus has-text-info`}></i>
                        </span>
                    </a>
                )
                if (data && data.createFollow) {
                    return <Unfollow size={this.props.size} userId={userId} />
                }
            }}
        </Mutation>
    }
}

export default Follow;
