import React, { Component } from 'react';
import UserPhoto from '../../auth/UserPhoto';
import { Query, Mutation } from 'react-apollo';
import { AUTHENTICATED, COMMENTS, POST, USER_PHOTO } from '../../../apollo/queries';
import { showModal } from '../../../apollo/clientWrites';
import { CREATE_COMMENT } from '../../../apollo/mutations';

const update = id => {
    return (proxy, { data: { createComment } }) => {
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        const { user } = proxy.readQuery({ query: USER_PHOTO })
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
        tagsText: ''
    }
    onSubmit = createComment => {
        return async e => {
            e.preventDefault()
            const tags = this.getMatches(this.state.tagsText, /#(\w+)/g)
            const comment_text = this.state.input;
            await createComment({ variables: { post_id: this.props.postId, comment_text, tags } })
            this.setState({
                input: '',
                tagsText: ''
            })
        }
    }
    getMatches(string, regex, index) {
        index || (index = 1);
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
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
                                    <a onClick={() => showModal({ display: 'Login', message: '', active: true })}>Log in</a>  to comment.
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
                                                    <textarea onChange={e => this.setState({ input: e.target.value })} value={this.state.input} className="textarea" rows="2" placeholder="Add a comment..."></textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <textarea onChange={e => this.setState({ tagsText: e.target.value })} value={this.state.tagsText} className="textarea" rows="1" placeholder="Add tags to your comment"></textarea>
                                                </p>
                                            </div>
                                            <div className="field">
                                                <p className="control">
                                                    <button type="submit" className={`button is-primary is-outlined ${loading && 'is-loading'}`}>Post Comment</button>
                                                </p>
                                            </div>
                                        </form>
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
