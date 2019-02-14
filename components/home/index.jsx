import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link';
import Trending from './Trending'
import Recent from './Recent';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';
import { Query } from 'react-apollo';
import { SEARCH_POSTS, AUTHENTICATED, CURRENT_USER, CURRENT_USER_TAGS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';

const gqlQueries = {
    posts: SEARCH_POSTS
}
class Home extends Component {
    state = {
        fetching: false,

    }
    handleScroll = (display, client, { limit, cursor, exclude, tags }) => {
        const options = 'posts'
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
            const bool = scrollTop > scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight))
            console.log(scrollTop, scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight)), bool, cursor);
            if (this.state.fetching) { return }
            if (bool) {
                this.setState({ fetching: display }, async () => {
                    try {
                        const newItems = await client.query({ query: SEARCH_POSTS, variables: { input } }).catch(e => { debugger })
                        const data = await client.cache.readQuery({ query: SEARCH_POSTS, variables: { input: { ...input, cursor: 0 } } })
                        data[display].cursor = newItems.data[display].cursor
                        data[display].results.push(...newItems.data[display].results)
                        client.cache.writeQuery({ query: gqlQueries[options], variables: { input: { ...input, cursor: 0 } }, data })
                        this.setState({ fetching: null })
                        avgItemHeight = null
                    } catch (e) {
                        this.setState({ fetching: null })
                        console.log(e);
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
                    <div className="columns">
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
                                    <Query query={CURRENT_USER_TAGS}>
                                        {({ loading, error, data }) => {
                                            if (loading || error) {
                                                return (
                                                    <div className="column is-two-thirds has-text-centered load-error">
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
                                                            <div className="column is-two-thirds has-text-centered load-error">
                                                                {loading && <Loading size="5x" />}
                                                                {error && <ErrorIcon size="5x" />}
                                                            </div>
                                                        )
                                                    }
                                                    data.posts.results = data.posts.results.filter(post => !post.author.isMe)
                                                    return (
                                                        <div onScroll={this.handleScroll('posts', client, { ...inputSuggested, cursor: data.posts.cursor })} className="column is-two-thirds recent">
                                                            <article className="media">
                                                                <div className="media-content font-2 has-text-centered">
                                                                    <div className="content">
                                                                        <h1 className="title is-4">Recent</h1>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                            <Recent data={data.posts} end={!data.posts.cursor} />
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
                                            return (
                                                <div onScroll={this.handleScroll('posts', client, { ...inputRecent, cursor: data.posts.cursor })} className="column is-two-thirds recent">
                                                    <article className="media">
                                                        <div className="media-content font-2 has-text-centered">
                                                            <div className="content">
                                                                <h1 className="title is-4">Recent</h1>
                                                            </div>
                                                        </div>
                                                    </article>
                                                    <Recent data={data.posts} end={!data.posts.cursor} />
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
