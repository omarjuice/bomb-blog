import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { getMatches, updateTags, tagRegex } from '../../utils';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { USER_TAGS } from '../../apollo/queries';
import { UPDATE_PROFILE } from '../../apollo/mutations';
import { setSearch } from '../../apollo/clientWrites';

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
            const modTags = updateTags(this.state.tags, getMatches(this.state.input, tagRegex))
            await insertTags({ variables: { input: { modTags } } })
            this.setState({ editing: false, tags: [], input: '' })
        }
    }

    render() {
        return (
            <Query query={USER_TAGS} variables={{ id: this.props.userId }}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />;
                    if (error) return <ErrorIcon />;
                    const { tags, username } = data.user
                    const isMe = data.user.isMe || this.props.isMe
                    const editButton = i => <button className={`button ${i % 2 === 0 ? 'is-dark' : 'is-primary'}`}
                        onClick={this.editTags(data.user.tags.map(tag => tag.tag_name))}>
                        <i className="fas fa-pencil-alt"></i>
                    </button>
                    if (!this.state.editing) return (
                        <div>
                            {tags.length > 0 ? <div className="tags">
                                {tags.map((tag, i) => {
                                    return <> <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id}
                                        className={`tag is-rounded font-1 is-medium ${i % 2 === 1 ? 'is-dark' : 'is-primary'}`}>{tag.tag_name}</a>
                                        {i === tags.length - 1 && isMe ? editButton(i) : ''}</>

                                })}
                            </div> : isMe ? <><p className="content">You have no tags. What are you interested in?</p>{editButton}</> : <p className="content">{username} has no tags.</p>}
                        </div>
                    );
                    return (
                        <Mutation mutation={UPDATE_PROFILE} refetchQueries={[`UserTags`]}>
                            {(updateProfile, { loading, error, data }) => {
                                if (error) return <ErrorIcon size="2x" color="primary" />;
                                if (!data) return (
                                    <form action="" onSubmit={this.handleSubmit(updateProfile)}>
                                        <textarea className="textarea" placeholder="#tag1 #tag2"
                                            value={this.state.input}
                                            onChange={(e) => this.setState({ input: e.target.value })} ></textarea>
                                        <button type="submit" className={`button is-dark ${loading && 'is-loading'}`}>Submit</button>
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
