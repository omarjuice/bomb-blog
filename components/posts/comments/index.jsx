import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { COMMENTS } from '../../../apollo/queries';
import Loading from '../../meta/Loading';
import ErrorIcon from '../../meta/ErrorIcon';
import Comment from './Comment';
import CreateComment from './CreateComment'
class Comments extends Component {
    render() {
        return (
            <div>
                <Query query={COMMENTS} variables={{ id: this.props.id }}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading size="5x" color="primary" style="margin-top: 5rem" />
                        if (error) return <ErrorIcon size="5x" color="primary" style="margin-top: 5rem" />

                        return (
                            <>
                                <hr />
                                <div>
                                    {data.post.comments.length < 1 ?
                                        <>
                                            <div className="is-size-5 font-2">Be the first to comment on this post!</div>
                                            <hr />
                                        </> : ''}
                                    {data.post.comments.map((comment) => <Comment key={comment.id} {...comment} />)}
                                </div>
                                <hr />
                                <CreateComment postId={this.props.id} />

                            </>
                        )

                    }}
                </Query>

            </div>
        );
    }
}

export default Comments;
