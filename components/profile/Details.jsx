import React, { Component } from 'react';
import Unfollow from './UnFollow';
import Follow from './Follow'
class Details extends Component {

    render() {
        const { imFollowing, followingMe, isMe, user_id } = this.props.details

        return (
            <div className="columns is-multiline is-mobile is-centered">
                <div className="column is-half has-text-centered">
                    {isMe ? '' : imFollowing ? <Unfollow user_id={user_id} size="large" /> : <Follow user_id={user_id} size="large" />}
                    {isMe ? '' : <h3 className="subtitle is-6">{imFollowing ? 'Unfollow' : 'Follow'}</h3>}
                </div>

                {followingMe ? <div className="column is-half has-text-centered">
                    <span className="icon"><i className="fas fa-3x fa-user-check has-text-success"></i></span>
                    <h3 className="subtitle is-6">Following you</h3>
                </div> : ''}
            </div>
        );
    }
}

export default Details;
