import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { UNFEATURE_POST } from '../../apollo/mutations';
import Feature from './Feature';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';

class Unfeature extends Component {
    render() {
        const { id } = this.props
        return (
            <Mutation mutation={UNFEATURE_POST}>
                {(unfeaturePost, { loading, error, data }) => {
                    if (loading) return <Loading />
                    if (error) return <ErrorIcon />
                    if (data && data.unfeaturePost) {
                        return <Feature id={id} />
                    }
                    return (
                        <a onClick={() => unfeaturePost({ variables: { id } })} className="has-text-primary">
                            <span className="icon"><i className="fas fa-star"></i></span>
                        </a>
                    )
                }}
            </Mutation>
        );
    }
}

export default Unfeature;
