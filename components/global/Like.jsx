import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { ILIKEPOST } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import LikePost from '../posts/LikePost';
import UnlikePost from '../posts/UnlikePost';

class Like extends Component {
    render() {
        const { size, scale } = this.props
        return (

            <Query query={ILIKEPOST} variables={{ id: this.props.postId }} ssr={false}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading color="primary" size={size || 'lg'} />;
                    if (error) return <ErrorIcon color="primary" size={size || 'lg'} />
                    const { iLike, numLikes, id } = data.post
                    return (<>
                        {iLike ? <UnlikePost postId={id} size={size} scale={scale} /> : <LikePost postId={id} size={size} scale={scale} />}
                        <br />
                        <p className="is-size-4 font-1">{numLikes}</p>
                    </>
                    )

                    // <span className="icon has-text-primary"><i className={`${iLike ? "fas" : "far"} fa-heart fa-${size || 'lg'}`}></i></span>

                }}
            </Query>

        );
    }
}

export default Like;
