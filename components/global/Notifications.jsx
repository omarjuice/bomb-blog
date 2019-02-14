import React, { Component } from 'react';
import { Subscription } from 'react-apollo'
import { NEW_POST } from '../../apollo/subscriptions';
class Notifications extends Component {
    render() {
        return (
            <div>
                <Subscription subscription={NEW_POST}>
                    {({ data, loading, error }) => {
                        if (error) console.log(error);
                        if (loading || error) return <div></div>
                        return <h4>{data.newPost.title}</h4>
                    }}
                </Subscription>
            </div>
        );
    }
}

export default Notifications;
