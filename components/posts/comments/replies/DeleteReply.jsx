import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import ErrorIcon from '../../../meta/ErrorIcon';
import { REPLIES, COMMENTS } from '../../../../apollo/queries';
import { DELETE_REPLY } from '../../../../apollo/mutations';

const update = (id, reply_id, post_id) => {
    return (proxy, { data: { deleteReply } }) => {
        if (!deleteReply) return
        {
            const data = proxy.readQuery({ query: REPLIES, variables: { id } })
            data.comment.replies = data.comment.replies.filter(reply => reply.id !== reply_id)
            proxy.writeQuery({ query: REPLIES, data })
        }
        {
            const data = proxy.readQuery({ query: COMMENTS, variables: { id: post_id } })
            data.post.comments.forEach(comment => {
                if (comment.id === id) {
                    comment.numReplies--
                }
            })
            proxy.writeQuery({ query: COMMENTS, variables: { id: post_id }, data })
        }
    }

}

class DeleteReply extends Component {
    state = {
        confirmation: false
    }
    handleClick = deleteReply => {
        return async () => {
            await deleteReply({
                variables: {
                    reply_id: this.props.replyId
                },
                optimisticResponse: {
                    __typename: "Mutation",
                    deleteReply: true
                }
            })
        }
    }
    render() {
        return (
            <div className="media-right">
                <Mutation mutation={DELETE_REPLY} update={update(this.props.commentId, this.props.replyId, this.props.postId)} >
                    {(deleteReply, { error, data }) => {
                        if (error) return <ErrorIcon size="lg" />
                        if (data && data.deleteReply) {
                            return <span className="has-text-warning has-text-weight-bold">DELETED</span>
                        }
                        if (!this.state.confirmation) {
                            return (
                                <button className="delete" onClick={() => this.setState({ confirmation: true })}></button>
                            )
                        }
                        return (
                            <>
                                Delete? <a onClick={this.handleClick(deleteReply)}
                                    className="has-text-success has-text-weight-bold">
                                    Yes
                                </a> · <a onClick={() => this.setState({ confirmation: false })}
                                    className="has-text-danger has-text-weight-bold">
                                    No
                                    </a>
                            </>
                        )
                    }}
                </Mutation>
            </div >
        )

    }
}

export default DeleteReply;
