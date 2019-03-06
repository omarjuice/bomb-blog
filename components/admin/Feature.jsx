import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { FEATURE_POST } from '../../apollo/mutations';
import Unfeature from './Unfeature';
import ErrorIcon from '../meta/ErrorIcon';

class Feature extends Component {
    render() {
        const { id } = this.props
        return (
            <Mutation mutation={FEATURE_POST} optimisticResponse={{ __typename: "Mutation", featurePost: true }} refetchQueries={[`TrendingPosts`]}>
                {(featurePost, { error, data }) => {
                    if (error) return <ErrorIcon />
                    if (data && data.featurePost) {
                        return <Unfeature id={id} />
                    }
                    return (
                        <a onClick={() => featurePost({ variables: { id } })} className="has-text-primary">
                            <span className="icon"><i className="far fa-star"></i></span>
                        </a>
                    )
                }}
            </Mutation>
        );
    }
}

export default Feature;
