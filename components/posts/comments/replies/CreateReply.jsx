import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import UserPhoto from '../../../auth/UserPhoto';
import { CREATE_REPLY } from '../../../../apollo/mutations';
import { AUTHENTICATED, REPLIES, CURRENT_USER, COMMENTS } from '../../../../apollo/queries';
import { renderModal } from '../../../../apollo/clientWrites';

const update = (id, post_id) => {
    return (proxy, { data: { createReply } }) => {
        {
            const data = proxy.readQuery({ query: REPLIES, variables: { id } })
            const { user } = proxy.readQuery({ query: CURRENT_USER })
            user.isMe = true
            data.comment.replies.push({ ...createReply, replier: user })
            proxy.writeQuery({ query: REPLIES, variables: { id }, data })
        }
        {
            const data = proxy.readQuery({ query: COMMENTS, variables: { id: post_id } })
            data.post.comments.forEach(comment => {
                if (comment.id === id) {
                    comment.numReplies++
                }
            })
            proxy.writeQuery({ query: COMMENTS, variables: { id: post_id }, data })
        }
    }

}
class CreateReply extends Component {
    state = {
        input: '',
        error: false
    }
    onSubmit = createReply => {
        return async e => {
            e.preventDefault()
            if (this.state.input.length < 1) return this.setState({ error: true })
            await createReply({ variables: { comment_id: this.props.commentId, reply_text: this.state.input } })
            this.setState({
                input: ''
            })
        }
    }
    render() {
        return (
            <Query query={AUTHENTICATED}>
                {({ loading, error, data }) => {
                    if (loading || error || !data.authenticated) {
                        return (
                            <article className="media">
                                <figure className="media-left">
                                    <i className="fas fa-reply fa-3x"></i>
                                </figure>
                                <div className="media-content">
                                    <div className="content is-size-5">
                                        <a onClick={() => renderModal({ display: 'Login', message: '', active: true })}>Log in</a>  to reply.
                                    </div>
                                </div>
                            </article>
                        )
                    }

                    return (
                        <Mutation mutation={CREATE_REPLY} update={update(this.props.commentId, this.props.postId)}>
                            {(createReply, { loading, error }) => {
                                return <article className="media">
                                    <figure className="media-left">
                                        <p className="image is-48x48">
                                            <UserPhoto />
                                        </p>
                                    </figure>
                                    <div className="media-content">
                                        <form action="" className="form" onSubmit={!loading && !error ? this.onSubmit(createReply) : undefined}>
                                            <div className="field">
                                                <p className="control">
                                                    <textarea onChange={e => this.setState({ input: e.target.value, error: false })} value={this.state.input} className={`textarea ${this.state.error ? 'is-primary' : ''}`} rows="2" placeholder="Add a reply..."></textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <button type="submit" className={`button is-dark is-outlined ${loading && 'is-loading'}`}>Reply</button>
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </article>
                            }}
                        </Mutation>
                    )
                }}
            </Query>
        );
    }
}

export default CreateReply;
