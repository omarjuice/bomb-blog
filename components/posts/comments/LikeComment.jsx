import React, { Component } from 'react';
import { LIKE_COMMENT } from '../../../apollo/mutations';
import { Mutation } from 'react-apollo';
import Loading from '../../meta/Loading';
import ErrorIcon from '../../meta/ErrorIcon';
import { COMMENTS } from '../../../apollo/queries';

const update = (id, comment_id) => {
    return (proxy, { data: { likeComment } }) => {
        if (!likeComment) return;
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        data.post.comments = data.post.comments.map(comment => {
            if (comment.id === comment_id) {
                comment.iLike = true;
                comment.numLikes++
            }
            return comment
        })
        proxy.writeQuery({ query: COMMENTS, variables: { id }, data })
    }
}

class LikeComment extends Component {
    render() {
        return (
            <Mutation mutation={LIKE_COMMENT} variables={{ comment_id: this.props.commentId }} update={update(this.props.postId, this.props.commentId)}>
                {(likeComment, { loading, error }) => {
                    if (loading) return <Loading />
                    if (error) return <ErrorIcon />
                    return (
                        <a onClick={likeComment}
                            className="has-text-weight-bold has-text-primary">Like</a>
                    )
                }}
            </Mutation>
        );
    }
}

export default LikeComment;
