import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { ILIKEPOST } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';

class Like extends Component {
    render() {
        const { size } = this.props
        return (
            <Query query={ILIKEPOST} variables={{ id: this.props.postId }} ssr={this.props.ssr || false} fetchPolicy="network-only">
                {({ loading, error, data }) => {
                    if (loading) return <Loading color="primary" size={size || 'lg'} />;
                    if (error) return <ErrorIcon color="primary" size={size || 'lg'} />
                    const { iLike } = data.post
                    return (
                        <span className="icon has-text-primary"><i className={`${iLike ? "fas" : "far"} fa-heart fa-${size || 'lg'}`}></i></span>
                    )
                }}
            </Query>
        );
    }
}

export default Like;
