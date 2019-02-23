import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import ErrorIcon from '../../meta/ErrorIcon';
import { COMMENTS, COMMENT_LIKERS, CURRENT_USER } from '../../../apollo/queries';
import { UNLIKE_COMMENT } from '../../../apollo/mutations';

const update = (id, comment_id) => {
    return (proxy, { data: { unlikeComment } }) => {
        if (!unlikeComment) return;
        try {
            const currentUser = proxy.readQuery({ query: CURRENT_USER })
            const commentLikers = proxy.readQuery({ query: COMMENT_LIKERS, variables: { id: comment_id } })
            commentLikers.comment.likers = commentLikers.comment.likers.filter(liker => liker.id !== currentUser.user.id)
            proxy.writeQuery({ query: COMMENT_LIKERS, variables: { id }, data: commentLikers })
        } catch (e) { }
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        data.post.comments = data.post.comments.map(comment => {
            if (comment.id === comment_id) {
                comment.iLike = false
                comment.numLikes--
            }
            return comment
        })
        proxy.writeQuery({ query: COMMENTS, variables: { id }, data })
    }
}

class UnlikeComment extends Component {
    render() {
        return (
            <Mutation mutation={UNLIKE_COMMENT}
                variables={{ comment_id: this.props.commentId }}
                update={update(this.props.postId, this.props.commentId)}
                optimisticResponse={{ __typename: "Mutation", unlikeComment: true }}>
                {(unlikeComment, { error }) => {
                    if (error) return <ErrorIcon />
                    return (
                        <a onClick={unlikeComment} className="has-text-weight-bold has-text-primary">Unlike</a>
                    )
                }}
            </Mutation>
        );
    }
}

export default UnlikeComment;
