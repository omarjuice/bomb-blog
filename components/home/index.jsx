import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link';
import Trending from './Trending'
import Recent from './Recent';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';
import { Query } from 'react-apollo';
import { SEARCH_POSTS, AUTHENTICATED, CURRENT_USER, CURRENT_USER_TAGS, FOLLOWEE_POSTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import Feed from './Feed';

const gqlQueries = {
    posts: SEARCH_POSTS
}
class Home extends Component {
    state = {
        fetching: false,

    }
    handleScroll = (display, client, { limit, cursor, exclude, tags }, query = SEARCH_POSTS) => {
        const input = { limit, cursor }
        if (tags) {
            input.tags = tags
        }
        else if (exclude) {
            input.exclude = exclude
        }

        let avgItemHeight = null
        const calcAvgItemHeight = (last, first, children) => {
            const height = (last.offsetTop - first.offsetTop) / (children.length - 2)
            console.log('AVGHEIGHT, ', height);
            return height
        }
        return async ({ target: { scrollTop, lastElementChild, children, scrollHeight, clientHeight } }) => {
            if (!cursor) return
            if (!avgItemHeight) {
                avgItemHeight = calcAvgItemHeight(lastElementChild, document.querySelector('.recent'), children)
            }
            const bool = scrollTop > scrollHeight - (avgItemHeight * (1 + clientHeight / avgItemHeight))
            console.log(scrollTop, scrollHeight - (avgItemHeight * (1 + clientHeight / avgItemHeight)), bool, cursor);
            if (this.state.fetching) { return }
            if (bool) {
                this.setState({ fetching: display }, async () => {
                    try {
                        if (query === SEARCH_POSTS) {
                            const newItems = await client.query({ query, variables: { input } })
                            const data = await client.cache.readQuery({ query, variables: { input: { ...input, cursor: 0 } } })
                            data.posts.cursor = newItems.data.posts.cursor
                            data.posts.results.push(...newItems.data.posts.results)
                            client.cache.writeQuery({ query, variables: { input: { ...input, cursor: 0 } }, data })
                        }
                        if (query === FOLLOWEE_POSTS) {
                            const newItems = await client.query({ query, variables: { limit, cursor } })
                            const data = await client.cache.readQuery({ query, variables: { limit, cursor: 0 } })
                            data.user.followingPosts.cursor = newItems.data.user.followingPosts.cursor
                            data.user.followingPosts.results.push(...newItems.data.user.followingPosts.results)
                            client.cache.writeQuery({ query, variables: { limit, cursor: 0 } })
                        }
                        this.setState({ fetching: null })
                        avgItemHeight = null
                    } catch (e) {
                        this.setState({ fetching: null })
                    }
                })
            }
        }
    }
    render() {
        const { trending } = this.props.data
        const inputRecent = { cursor: 0, limit: 5, exclude: trending.results.map(post => post.id) }
        const inputSuggested = { cursor: 0, limit: 5, tags: [] }
        return (
            <div>
                <Trending posts={this.props.data.trending.results} />
                <br />

                <hr />
                <div className="container">
                    <div className="columns is-tablet">
                        <Query query={AUTHENTICATED} ssr={false}>
                            {({ loading, error, data }) => {
                                if (loading || error) {
                                    return (
                                        <div className="column is-two-thirds has-text-centered load-error">
                                            {loading && <Loading size="5x" />}
                                            {error && <ErrorIcon size="5x" />}
                                        </div>
                                    )
                                }
                                if (data.authenticated) return (
                                    <>
                                        <Query query={FOLLOWEE_POSTS} variables={{ limit: 5, cursor: 0 }} ssr={false}>
                                            {({ loading, error, data, client }) => {
                                                if (error) console.log(error)
                                                if (loading || error) {
                                                    return (
                                                        <div className="column is-two-thirds has-text-centered load-error">
                                                            {loading && <Loading size="5x" />}
                                                            {error && <ErrorIcon size="5x" />}
                                                        </div>
                                                    )
                                                }

                                                if (data.user) return (
                                                    <div onScroll={this.handleScroll('feed', client, { cursor: data.user.followingPosts.cursor, limit: 5 }, FOLLOWEE_POSTS)} className="column is-two-thirds recent">
                                                        <article className="media">
                                                            <div className="media-content font-2 has-text-centered">
                                                                <div className="content">
                                                                    <h1 className="title is-4">Feed</h1>
                                                                </div>
                                                            </div>
                                                        </article>
                                                        <Feed data={data.user.followingPosts} end={!data.user.followingPosts.cursor} />

                                                        {this.state.fetching === 'feed' && (
                                                            <article className="media">
                                                                <div className="media-content font-2 has-text-centered">
                                                                    <div className="content has-text-centered">
                                                                        <Loading size="4x" style="margin-top:2rem" />
                                                                    </div>
                                                                </div>
                                                            </article>)}
                                                    </div>
                                                )
                                            }}
                                        </Query>
                                        <Query query={CURRENT_USER_TAGS} ssr={false} fetchPolicy={"network-only"}>
                                            {({ loading, error, data }) => {
                                                if (loading || error) {
                                                    return (
                                                        <div className="column is-one-third has-text-centered load-error">
                                                            {loading && <Loading size="5x" />}
                                                            {error && <ErrorIcon size="5x" />}
                                                        </div>
                                                    )
                                                }
                                                inputSuggested.tags.push(...data.user.tags.map(tag => tag.tag_name))
                                                return <Query query={SEARCH_POSTS} variables={{ input: inputSuggested }} ssr={false}>
                                                    {({ loading, error, data, client }) => {
                                                        if (loading || error) {
                                                            return (
                                                                <div className="column is-one-third has-text-centered load-error">
                                                                    {loading && <Loading size="5x" />}
                                                                    {error && <ErrorIcon size="5x" />}
                                                                </div>
                                                            )
                                                        }
                                                        data.posts.results = data.posts.results.filter(post => !post.author.isMe)
                                                        return (
                                                            <div onScroll={this.handleScroll('posts', client, { ...inputSuggested, cursor: data.posts.cursor })} className="column is-one-third recent notification">
                                                                <article className="media">
                                                                    <div className="media-content font-2 has-text-centered">
                                                                        <div className="content">
                                                                            <h1 className="title is-4">Suggested</h1>
                                                                        </div>
                                                                    </div>
                                                                </article>
                                                                <Recent data={data.posts} showTags={false} end={!data.posts.cursor} />
                                                                {this.state.fetching === 'posts' && (
                                                                    <article className="media">
                                                                        <div className="media-content font-2 has-text-centered">
                                                                            <div className="content has-text-centered">
                                                                                <Loading size="4x" style="margin-top:2rem" />
                                                                            </div>
                                                                        </div>
                                                                    </article>)}
                                                            </div>
                                                        )
                                                    }}
                                                </Query>
                                            }}
                                        </Query>

                                    </>
                                )
                                if (!data.authenticated) return (
                                    <Query query={SEARCH_POSTS} variables={{ input: inputRecent }} ssr={false}>
                                        {({ loading, error, data, client }) => {
                                            if (loading || error) {
                                                return (
                                                    <div className="column is-two-thirds has-text-centered load-error">
                                                        {loading && <Loading size="5x" />}
                                                        {error && <ErrorIcon size="5x" />}
                                                    </div>
                                                )
                                            }
                                            return (<>
                                                <div onScroll={this.handleScroll('posts', client, { ...inputRecent, cursor: data.posts.cursor })} className="column is-two-thirds recent">
                                                    <article className="media">
                                                        <div className="media-content font-2 has-text-centered">
                                                            <div className="content">
                                                                <h1 className="title is-4">Recent</h1>
                                                            </div>
                                                        </div>
                                                    </article>
                                                    <Recent data={data.posts} showTags={true} end={!data.posts.cursor} />
                                                    {this.state.fetching === 'posts' && (
                                                        <article className="media">
                                                            <div className="media-content font-2 has-text-centered">
                                                                <div className="content has-text-centered">
                                                                    <Loading size="4x" style="margin-top:2rem" />
                                                                </div>
                                                            </div>
                                                        </article>)}
                                                </div>
                                                <div className="column is-one-third">
                                                    <div className="tile is-vertical notification has-text-centered font-2">

                                                        <a className="subtitle is-4" onClick={() => renderModal({ active: true, display: 'Login' })}>Login</a>
                                                        <p className="subtitle is-4">OR</p>
                                                        <a className="subtitle is-4" onClick={() => renderModal({ active: true, display: 'Register' })}>Sign Up</a>
                                                        <p className="subtitle">To see your Feed</p>
                                                    </div>
                                                </div>
                                            </>
                                            )
                                        }}
                                    </Query>)
                            }}
                        </Query>
                    </div>
                </div>
                <style jsx>{`
                    .recent{
                        height: 85vh;
                        overflow: scroll;
                        -webkit-overflow-scrolling: touch
                    }
                    .load-error{
                        margin-top: 2rem;
                    }
                    hr {
                        height: 12px;
                        border: 0;
                        box-shadow: inset 0 12px 12px -12px rgba(0, 0, 0, 0.5);
                    }
                    `}</style>
            </div>
        );
    }
}

export default Home;
