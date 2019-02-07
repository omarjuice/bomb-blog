import React, { Component } from 'react';
import { getMatches } from '../../utils/index';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL, SEARCH_COMMENTS } from '../../apollo/queries';
import { Query } from 'react-apollo';
import Posts from './Posts';
import Users from './Users';
import Comments from './Comments'
const gqlQueries = {
    users: SEARCH_USERS,
    posts: SEARCH_POSTS,
    comments: SEARCH_COMMENTS,
    all: SEARCH_ALL
}
class SearchPage extends Component {
    state = {
        active: this.props.options === 'all' ? 'posts' : this.props.options,
        fetching: false
    }
    handleScroll = (display, client, { search, tags, limit, cursor, newCursor }) => {
        const { options } = this.props
        const getUpdateHeight = (cursor) => 1 - (1 / (cursor / 2.5))
        return async ({ target: { scrollTop, scrollHeight } }) => {
            if (!newCursor) return
            console.log(scrollTop, getUpdateHeight(newCursor), getUpdateHeight(newCursor) * scrollHeight, scrollTop > scrollHeight * getUpdateHeight(newCursor))
            if (this.state.fetching) { return }
            if (scrollTop + 100 > scrollHeight * getUpdateHeight(newCursor)) {
                this.setState({ fetching: true }, async () => {
                    const newItems = await client.query({ query: gqlQueries[display], variables: { input: { search, tags, limit, cursor: newCursor } } })
                    const data = client.cache.readQuery({ query: gqlQueries[options], variables: { input: { search, tags, limit, cursor } } })
                    console.log(newItems)
                    data[display].cursor = newItems.data[display].cursor
                    data[display].results.push(...newItems.data[display].results)
                    client.cache.writeQuery({ query: gqlQueries[options], variables: { input: { search, tags, limit, cursor } }, data })
                    this.setState({ fetching: false })
                })
            }
        }
    }
    render() {
        const { input, options } = this.props
        const tagRegex = /#(\w+)/g
        const tags = input ? getMatches(input, tagRegex) : [];
        const search = input ? input.replace(tagRegex, '').trim().replace(/\s+/g, ' ') : ''
        const limit = options === 'all' ? 5 : 10
        const variables = {
            input: {
                search,
                tags,
                limit,
                cursor: 0
            }
        }

        let header = ''
        if (search) {
            header += search
        }
        if (tags) {
            header += ' ' + tags.map(tag => '#' + tag).join(' ')
        };
        return (
            <div>
                <div className="columns is-centered is-mobile is-multiline">
                    <Query query={gqlQueries[options]} variables={variables} ssr={false}>
                        {({ loading, error, data, client }) => {
                            if (loading) return <Loading size="5x" />
                            if (error) return <ErrorIcon size="5x" />
                            let numUsers;
                            let numPosts;
                            try {
                                numUsers = data.users.length
                            } catch (e) { numUsers = 0 }
                            try {
                                numPosts = data.posts.length
                            } catch (e) { numPosts = 0 }
                            return (<>
                                <div className="column is-full has-text-centered">
                                    <h1 className="title is-2">{numUsers < 1 && numPosts < 1 ? <p>No results found for <em>{header}</em></p> : <p>Results for "<em>{header}</em>"</p>}</h1>
                                    <div className="tabs is-centered is-hidden-tablet">
                                        <ul>
                                            {data.posts ? <li className={this.state.active === 'posts' && 'is-active'}><a onClick={() => this.setState({ active: 'posts' })}>Posts</a></li> : ''}
                                            {data.users ? <li className={this.state.active === 'users' && 'is-active'}><a onClick={() => this.setState({ active: 'users' })}>Users</a></li> : ''}
                                            {data.users ? <li className={this.state.active === 'comments' && 'is-active'}><a onClick={() => this.setState({ active: 'comments' })}>Comments</a></li> : ''}
                                        </ul>
                                    </div>
                                </div>

                                {data.posts ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'posts' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('posts', client, { ...variables.input, newCursor: data.posts.cursor })}>
                                            <article className="media">
                                                <div className="media-content font-2 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Posts</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Posts data={data.posts} input={variables.input} end={!data.posts.cursor} />
                                        </div>
                                    </div> : ''}
                                {data.users ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'users' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('users', client, { ...variables.input, newCursor: data.users.cursor })}>
                                            <article className="media">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-2 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Users</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Users data={data.users} input={variables.input} end={!data.users.cursor} />
                                        </div>
                                    </div> : ''}
                                {data.comments ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'comments' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('comments', client, { ...variables.input, newCursor: data.comments.cursor })}>
                                            <article className="media">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-2 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Comments</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Comments data={data.comments} input={variables.input} end={!data.comments.cursor} />
                                        </div>
                                    </div> : ''}
                            </>
                            )
                        }}
                    </Query>
                </div>
                <style jsx>{`
                .columns{
                    margin-top: 5rem;
                }
                .box{
                    padding: 2rem;
                    height: 65vh;
                    overflow: scroll;
                    -webkit-overflow-scrolling: touch;
                }
                .tabs{
                    margin-bottom: -1.4rem
                }
                `}</style>
            </div>
        );
    }
}

export default SearchPage;
