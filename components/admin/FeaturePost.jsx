import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { IS_ADMIN } from '../../apollo/queries';
import Unfeature from './Unfeature';
import Feature from './Feature';

class FeaturePost extends Component {
    render() {
        return (
            <Query query={IS_ADMIN} ssr={false}>
                {({ data }) => {
                    if (!data || !data.isAdmin) return null
                    if (data.isAdmin) {
                        if (!this.props.featured) return (
                            <Feature id={this.props.id} />
                        )
                        if (this.props.featured) return (
                            <Unfeature id={this.props.id} />
                        )
                    }
                }}
            </Query>
        );
    }
}

export default FeaturePost;
