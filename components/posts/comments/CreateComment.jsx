import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { getMatches, tagRegex } from '../../../utils';
import UserPhoto from '../../auth/UserPhoto';
import { AUTHENTICATED, COMMENTS, POST, CURRENT_USER } from '../../../apollo/queries';
import { renderModal } from '../../../apollo/clientWrites';
import { CREATE_COMMENT } from '../../../apollo/mutations';

const update = id => {
    return (proxy, { data: { createComment } }) => {
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        const { user } = proxy.readQuery({ query: CURRENT_USER })
        user.isMe = true
        data.post.comments.push({ ...createComment, commenter: user, numLikes: 0, numReplies: 0, iLike: false })
        proxy.writeQuery({ query: COMMENTS, variables: { id }, data })
        const postData = proxy.readQuery({ query: POST, variables: { id } })
        postData.post.numComments++;
        proxy.writeQuery({ query: POST, variables: { id }, data: postData })
    }
}

class CreateComment extends Component {
    state = {
        input: '',
        tagsText: '',
        error: false
    }
    onSubmit = createComment => {
        return async e => {
            e.preventDefault()
            const tags = getMatches(this.state.tagsText, tagRegex)
            const comment_text = this.state.input;
            if (comment_text.length < 1) return this.setState({ error: true });
            await createComment({ variables: { post_id: this.props.postId, comment_text, tags } })
            this.setState({
                input: '',
                tagsText: ''
            })
        }
    }

    render() {
        return <Query query={AUTHENTICATED}>
            {({ loading, error, data }) => {
                if (loading || error || !data.authenticated) {
                    return (
                        <article className="media">
                            <figure className="media-left">
                                <i className="fas fa-comment-alt fa-5x"></i>
                            </figure>
                            <div className="media-content">
                                <div className="content is-size-4">
                                    <a onClick={() => renderModal({ display: 'Login', message: '', active: true })}>Log in</a>  to comment.
                        </div>
                            </div>
                        </article>
                    )
                }
                return (
                    <Mutation mutation={CREATE_COMMENT} update={update(this.props.postId)}>
                        {(createComment, { loading, error }) => {
                            return (
                                <article className="media">
                                    <figure className="media-left">
                                        <p className="image is-48x48">
                                            <UserPhoto />
                                        </p>
                                    </figure>
                                    <div className="media-content">
                                        <form action="" className="form" onSubmit={!loading && !error ? this.onSubmit(createComment) : undefined}>
                                            <div className="field">
                                                <p className="control">
                                                    <textarea onChange={e => this.setState({ input: e.target.value, error: false })}
                                                        value={this.state.input}
                                                        className={`textarea ${this.state.error ? 'is-primary' : ''}`} rows="2" placeholder="Add a comment...">
                                                    </textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <textarea onChange={e => this.setState({ tagsText: e.target.value })}
                                                        value={this.state.tagsText} className="textarea" rows="1"
                                                        placeholder="#Add #tags #to #your #comment">
                                                    </textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <button type="submit" className={`button is-primary is-outlined ${loading && 'is-loading'}`}>Post Comment</button>
                                                </p>
                                            </div>
                                        </form>
                                        <br />

                                    </div>
                                </article>
                            )
                        }}
                    </Mutation>
                )
            }}
        </Query>

    }
}

export default CreateComment;
