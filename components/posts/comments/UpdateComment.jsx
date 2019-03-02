import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { updateTags, getMatches, tagRegex } from '../../../utils';
import { COMMENTS } from '../../../apollo/queries';
import { UPDATE_COMMENT } from '../../../apollo/mutations';

const update = (id, comment_id) => {
    return (proxy, { data: updateComment }) => {
        const data = proxy.readQuery({ query: COMMENTS, variables: { id } })
        data.post.comments = data.post.comments.map(comment => comment.id === comment_id ? { ...comment, ...updateComment } : comment)
        proxy.writeQuery({ query: COMMENTS, variables: { id }, data })
    }
}

class UpdateComment extends Component {
    state = {
        input: this.props.initialInput,
        tagsText: this.props.initialTags.map(tag => `#${tag}`).join(' ')
    }
    onSubmit = updateComment => {
        return async e => {
            e.preventDefault()
            const { input, tagsText } = this.state
            const { initialInput, initialTags, stopEdit } = this.props
            const inputChange = input !== initialInput
            const tagsChange = tagsText !== initialTags.join(' ')
            if (!inputChange && !tagsChange) {
                return stopEdit()
            }
            if (input.length < 1) {
                return stopEdit()
            }
            const modTags = tagsChange ? updateTags(this.props.initialTags, getMatches(this.state.tagsText, tagRegex)) : {};
            await updateComment({ variables: { comment_id: this.props.commentId, comment_text: input, modTags } })
            stopEdit()
        }
    }

    render() {
        return (
            <Mutation mutation={UPDATE_COMMENT} update={update(this.props.postId, this.props.commentId)}>
                {(updateComment, { loading, error }) => {
                    return (

                        <form action="" className="form" onSubmit={!loading && !error ? this.onSubmit(updateComment) : undefined}>
                            <div className="field">
                                <p className="control">
                                    <textarea onChange={e => this.setState({ input: e.target.value })}
                                        value={this.state.input} className="textarea" rows="2"></textarea>
                                </p>
                            </div>
                            <div className="field">
                                <p className="control">
                                    <textarea onChange={e => this.setState({ tagsText: e.target.value })}
                                        value={this.state.tagsText} className="textarea" rows="1"></textarea>
                                </p>
                            </div>
                            <div className="field is-grouped">
                                <p className="control">
                                    <button type="submit" className={`button is-primary is-outlined ${loading && 'is-loading'}`}>Submit</button>
                                </p>
                                <p className="control">
                                    <a onClick={this.props.stopEdit} className="button is-text has-text-danger has-text-weight-bold">Cancel</a>
                                </p>
                            </div>

                        </form>

                    )
                }}
            </Mutation>
        );
    }
}

export default UpdateComment;
