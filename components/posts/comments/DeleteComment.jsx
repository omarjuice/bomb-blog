import React, { Component } from 'react';
import { DELETE_COMMENT } from '../../../apollo/mutations';
import { Mutation } from 'react-apollo';
import { COMMENTS, POST } from '../../../apollo/queries';
import Loading from '../../meta/Loading';
import ErrorIcon from '../../meta/ErrorIcon';

const update = (id, comment_id) => {
    return (proxy, { data: { deleteComment } }) => {
        if (!deleteComment) return
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        data.post.comments = data.post.comments.filter(comment => comment.id !== comment_id)
        proxy.writeQuery({ query: COMMENTS, variables: { id }, data })
        const postData = proxy.readQuery({ query: POST, variables: { id } })
        postData.post.numComments--;
        proxy.writeQuery({ query: POST, variables: { id }, data: postData })
    }
}

class DeleteComment extends Component {
    state = {
        confirmation: false
    }
    handleClick = deleteComment => {
        return async () => {
            await deleteComment({
                variables: {
                    comment_id: this.props.commentId
                },
                optimisticResponse: {
                    __typename: "Mutation",
                    deleteComment: true
                }
            })
        }
    }
    render() {
        return (
            <div className="media-right">
                <Mutation mutation={DELETE_COMMENT} update={update(this.props.postId, this.props.commentId)} >
                    {(deleteComment, { error, data }) => {
                        if (error) return <ErrorIcon size="2x" />
                        if (data && data.deleteComment) {
                            return <span className="has-text-warning has-text-weight-bold">DELETED</span>
                        }
                        if (!this.state.confirmation) {
                            return (
                                <button className="delete" onClick={() => this.setState({ confirmation: true })}></button>
                            )
                        }
                        return (
                            <>Delete? <a onClick={this.handleClick(deleteComment)} className="has-text-success has-text-weight-bold">Yes</a> · <a onClick={() => this.setState({ confirmation: false })} className="has-text-danger has-text-weight-bold">No</a></>
                        )
                    }}
                </Mutation>
            </div >
        );
    }
}

export default DeleteComment;
