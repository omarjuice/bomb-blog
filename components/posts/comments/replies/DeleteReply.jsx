import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { DELETE_REPLY } from '../../../../apollo/mutations';
import Loading from '../../../meta/Loading';
import ErrorIcon from '../../../meta/ErrorIcon';
import { REPLIES } from '../../../../apollo/queries';

const update = (id, reply_id) => {
    return (proxy, { data: { deleteReply } }) => {
        if (!deleteReply) return
        const data = proxy.readQuery({ query: REPLIES, variables: { id } })
        data.comment.replies = data.comment.replies.filter(reply => reply.id !== reply_id)
        proxy.writeQuery({ query: REPLIES, data })
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
                }
            })
        }
    }
    render() {
        return (
            <div className="media-right">
                <Mutation mutation={DELETE_REPLY} update={update(this.props.commentId, this.props.replyId)} >
                    {(deleteReply, { loading, error, data }) => {
                        if (loading) return <Loading size="lg" />;
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
                            <>Delete ? <a onClick={this.handleClick(deleteReply)} className="has-text-success has-text-weight-bold">Yes</a> · <a onClick={() => this.setState({ confirmation: false })} className="has-text-danger has-text-weight-bold">No</a></>
                        )
                    }}
                </Mutation>
            </div >
        )

    }
}

export default DeleteReply;
