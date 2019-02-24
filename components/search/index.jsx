import React, { Component } from 'react';
import { getMatches } from '../../utils/index';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import { Query } from 'react-apollo';
import Posts from './Posts';
import Users from './Users';
import Comments from './Comments'
import Tags from './Tags';
import { SEARCH_USERS, SEARCH_POSTS, SEARCH_ALL, SEARCH_COMMENTS, SEARCH_TAGS } from '../../apollo/queries';
const gqlQueries = {
    users: SEARCH_USERS,
    posts: SEARCH_POSTS,
    comments: SEARCH_COMMENTS,
    tags: SEARCH_TAGS,
    all: SEARCH_ALL
}
class SearchPage extends Component {
    state = {
        active: this.props.options === 'all' ? 'posts' : this.props.options,
        fetching: null,
        postsFrame: 0,
        usersFrame: 0,
        commentsFrame: 0,
        tagsFrame: 0
    }
    handleScroll = (display, client, { search, tags, limit, cursor }) => {
        const { options } = this.props
        let avgItemHeight = null
        const calcAvgItemHeight = (last, first, children) => {
            const height = (last.offsetTop - first.offsetTop) / (children.length - 2)
            console.log('AVGHEIGHT, ', height);
            return height
        }
        return async ({ target: { scrollTop, lastElementChild, firstElementChild, children, scrollHeight, clientHeight } }) => {
            if (!cursor) return
            if (!avgItemHeight) {
                avgItemHeight = calcAvgItemHeight(lastElementChild, firstElementChild, children)
            }
            const bool = scrollTop > scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight))
            console.log(scrollTop, scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight)), bool, cursor);
            if (this.state.fetching) { return }
            if (bool) {
                this.setState({ fetching: display }, async () => {
                    const newItems = await client.query({ query: gqlQueries[display], variables: { input: { search, tags, limit, cursor } } })
                    const data = client.cache.readQuery({ query: gqlQueries[options], variables: { input: { search, tags, limit, cursor: 0 } } })
                    data[display].cursor = newItems.data[display].cursor
                    data[display].results.push(...newItems.data[display].results)
                    client.cache.writeQuery({ query: gqlQueries[options], variables: { input: { search, tags, limit, cursor: 0 } }, data })
                    this.setState({ fetching: null })
                    avgItemHeight = calcAvgItemHeight(lastElementChild, firstElementChild, children)
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
                            let numComments;
                            let numTags;
                            try {
                                numUsers = data.users.length
                            } catch (e) { numUsers = 0 }
                            try {
                                numPosts = data.posts.length
                            } catch (e) { numPosts = 0 }
                            try {
                                numComments = data.comments.length
                            } catch (e) { numComments = 0 }
                            try {
                                numTags = data.tags.length
                            } catch (e) { numTags = 0 }

                            return (<>
                                <div className="column is-full has-text-centered">
                                    <h1 className="title is-2">{numUsers < 1 && numPosts < 1 && numComments < 1 && numTags < 1 ? <p>No results found for <em>{header}</em></p> : <p>Results for <em>{header.length > 1 ? header : 'ALL'}</em></p>}</h1>
                                    <div className="tabs is-centered is-hidden-tablet">
                                        <ul>
                                            {data.posts ? <li className={this.state.active === 'posts' && 'is-active'}><a onClick={() => this.setState({ active: 'posts' })}>Posts</a></li> : ''}
                                            {data.users ? <li className={this.state.active === 'users' && 'is-active'}><a onClick={() => this.setState({ active: 'users' })}>Users</a></li> : ''}
                                            {data.users ? <li className={this.state.active === 'comments' && 'is-active'}><a onClick={() => this.setState({ active: 'comments' })}>Comments</a></li> : ''}
                                            {data.users ? <li className={this.state.active === 'tags' && 'is-active'}><a onClick={() => this.setState({ active: 'tags' })}>Tags</a></li> : ''}
                                        </ul>
                                    </div>
                                </div>

                                {data.posts ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'posts' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('posts', client, { ...variables.input, cursor: data.posts.cursor })}>
                                            <article className="media header">
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Posts</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Posts data={data.posts} input={variables.input} end={!data.posts.cursor} inputTags={variables.input.tags} />
                                            {this.state.fetching === 'posts' && <article className="media">
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <Loading size="4x" style="margin-top:2rem" />
                                                    </div>
                                                </div>
                                            </article>}
                                        </div>
                                    </div> : ''}
                                <div className={`column is-1-desktop ${data.posts ? 'is-hidden-touch' : 'is-hidden'}`}></div>
                                {data.users ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'users' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('users', client, { ...variables.input, cursor: data.users.cursor })}>
                                            <article className="media header">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Users</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Users data={data.users} input={variables.input} end={!data.users.cursor} inputTags={variables.input.tags} />
                                            {this.state.fetching === 'users' && <article className="media">
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <Loading size="4x" style="margin-top:2rem" />
                                                    </div>
                                                </div>
                                            </article>}
                                        </div>
                                    </div> : ''}

                                {data.comments ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'comments' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('comments', client, { ...variables.input, cursor: data.comments.cursor })}>
                                            <article className="media header">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Comments</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Comments data={data.comments} input={variables.input} end={!data.comments.cursor} inputTags={variables.input.tags} />
                                            {this.state.fetching === 'comments' && <article className="media">
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <Loading size="4x" style="margin-top:2rem" />
                                                    </div>
                                                </div>
                                            </article>}
                                        </div>
                                    </div> : ''}
                                <div className={`column is-1-desktop ${data.comments ? 'is-hidden-touch' : 'is-hidden'}`}></div>
                                {data.tags ?
                                    <div className={`column is-one-third-desktop is-half-tablet is-full-mobile ${this.state.active === 'tags' ? '' : 'is-hidden-mobile'}`}>
                                        <div className="box" onScroll={this.handleScroll('tags', client, { ...variables.input, cursor: data.tags.cursor })}>
                                            <article className="media header">
                                                <figure className="media-left">
                                                </figure>
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <h2 className="subtitle is-3 is-hidden-mobile">Tags</h2>
                                                    </div>
                                                </div>
                                            </article>
                                            <Tags data={data.tags} input={variables.input} end={!data.tags.cursor} inputTags={variables.input.tags} />
                                            {this.state.fetching === 'tags' && <article className="media">
                                                <div className="media-content font-1 has-text-centered">
                                                    <div className="content has-text-centered">
                                                        <Loading size="4x" style="margin-top:2rem" />
                                                    </div>
                                                </div>
                                            </article>}
                                        </div>
                                    </div> : ''}
                            </>
                            )
                        }}
                    </Query>
                </div>
                <style jsx>{`
                .columns{
                    margin-top: 2rem;
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
