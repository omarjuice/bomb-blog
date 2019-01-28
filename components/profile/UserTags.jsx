import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorMessage from '../meta/ErrorMessage';
import { USER_TAGS } from '../../apollo/queries';
import { EDIT_TAGS } from '../../apollo/mutations';

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
                    if (loading) return <Loading />;
                    if (error) return <ErrorMessage />;
                    if (!this.state.editing) return (
                        <div>
                            <div className="tags">
                                {data.user.tags.map((tag, i) => {
                                    return <span key={tag.id} className={`tag is-rounded font-2 is-medium ${i % 2 === 1 ? 'is-primary' : ''}`}>{tag.tag_name}</span>
                                })}
                                {data.user.isMe ? <button className=" button is-link" onClick={this.editTags(data.user.tags.map(tag => tag.tag_name))}><i className="fas fa-pencil-alt"></i></button> : ''}
                            </div>
                        </div>
                    );
                    return (
                        <Mutation mutation={EDIT_TAGS} refetchQueries={[`UserTags`]}>
                            {(updateProfile, { loading, error, data }) => {
                                if (loading) return <Loading />;
                                if (error) return <ErrorMessage />;
                                if (!data) return (
                                    <form action="" onSubmit={this.handleSubmit(updateProfile)}>
                                        <textarea class="textarea" placeholder="#tag1 #tag2"
                                            value={this.state.input}
                                            onChange={(e) => this.setState({ input: e.target.value })} ></textarea>
                                        <button type="submit" className="button is-link">Submit</button>
                                    </form>
                                )
                                if (data) return <UserTags user_id={this.props.userId} />
                            }}
                        </Mutation>
                    )
                }}
            </Query>
        );
    }
}

export default UserTags;
