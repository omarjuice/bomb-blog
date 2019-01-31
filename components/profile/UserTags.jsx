import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import { USER_TAGS } from '../../apollo/queries';
import { UPDATE_PROFILE } from '../../apollo/mutations';
import ErrorIcon from '../meta/ErrorIcon';

class UserTags extends Component {
    state = {
        editing: false,
        tags: [],
        input: ''
    }
    editTags = (tags) => {
        return () => {
            this.setState({
                editing: true,
                tags: tags,
                input: tags.map(tag => `#${tag}`).join(' ')
            })
        }
    }
    handleSubmit = insertTags => {
        return async e => {
            e.preventDefault()
            const oldTags = this.state.tags.reduce((acc, tag) => {
                acc[tag] = true
                return acc
            }, {})
            const inputTags = this.getMatches(this.state.input, /#(\w+)/g).reduce((acc, tag) => {
                acc[tag] = true
                return acc
            }, {})
            const addTags = [];
            const deleteTags = [];
            for (let tag in oldTags) {
                if (!inputTags[tag]) {
                    deleteTags.push(tag)
                }
            }
            for (let tag in inputTags) {
                if (!oldTags[tag]) {
                    addTags.push(tag)
                }
            }
            await insertTags({ variables: { input: { modTags: { addTags, deleteTags } } } })
            this.setState({ editing: false, tags: [], input: '' })

        }
    }
    getMatches(string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
    }
    render() {
        return (
            <Query query={USER_TAGS} variables={{ id: this.props.userId }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading size="2x" color="primary" />;
                    if (error) return <ErrorIcon />;
                    const { tags, isMe, username } = data.user
                    const editButton = <button className=" button is-info" onClick={this.editTags(data.user.tags.map(tag => tag.tag_name))}><i className="fas fa-pencil-alt"></i></button>
                    if (!this.state.editing) return (
                        <div>
                            {tags.length > 0 ? <div className="tags">
                                {tags.map((tag, i) => {
                                    return <span key={tag.id} className={`tag is-rounded font-2 is-medium ${i % 2 === 1 ? 'is-primary' : ''}`}>{tag.tag_name}</span>
                                })}
                                {isMe ? editButton : ''}
                            </div> : isMe ? <><p className="content">You have no tags. What are you interested in?</p>{editButton}</> : <p className="content">{username} has no tags.</p>}
                        </div>
                    );
                    return (
                        <Mutation mutation={UPDATE_PROFILE} refetchQueries={[`UserTags`]}>
                            {(updateProfile, { loading, error, data }) => {
                                if (loading) return <Loading size="2x" color="primary" />;
                                if (error) return <ErrorIcon size="2x" color="primary" />;
                                if (!data) return (
                                    <form action="" onSubmit={this.handleSubmit(updateProfile)}>
                                        <textarea className="textarea" placeholder="#tag1 #tag2"
                                            value={this.state.input}
                                            onChange={(e) => this.setState({ input: e.target.value })} ></textarea>
                                        <button type="submit" className="button is-info">Submit</button>
                                    </form>
                                )
                                return <p>DONE</p>
                            }}
                        </Mutation>
                    )
                }}
            </Query>
        );
    }
}

export default UserTags;
