import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link';
import Trending from './Trending'
import Recent from './Recent';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';
import { Query } from 'react-apollo';
import { SEARCH_POSTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';

const gqlQueries = {
    posts: SEARCH_POSTS
}
class Home extends Component {
    state = {
        fetching: false,

    }
    handleScroll = (display, client, { limit, cursor, exclude }) => {
        const options = 'posts'
        let avgItemHeight = null
        const calcAvgItemHeight = (last, first, children) => {
            const height = (last.offsetTop - first.offsetTop) / (children.length - 2)
            // console.log('AVGHEIGHT, ', height);
            return height
        }
        return async ({ target: { scrollTop, lastElementChild, firstElementChild, children, scrollHeight, clientHeight } }) => {
            if (!cursor) return
            if (!avgItemHeight) {
                avgItemHeight = calcAvgItemHeight(lastElementChild, firstElementChild, children)
            }
            const bool = scrollTop > scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight))
            // console.log(scrollTop, scrollHeight - (avgItemHeight * (2 + clientHeight / avgItemHeight)), bool, cursor);
            if (this.state.fetching) { return }
            if (bool) {
                this.setState({ fetching: display }, async () => {
                    console.log(gqlQueries[options]);
                    const newItems = await client.query({ query: gqlQueries[options], variables: { input: { limit, cursor, exclude } } }).catch(e => { debugger })
                    const data = client.cache.readQuery({ query: gqlQueries[options], variables: { input: { limit, cursor: 0, exclude } } })
                    data[display].cursor = newItems.data[display].cursor
                    data[display].results.push(...newItems.data[display].results)
                    client.cache.writeQuery({ query: gqlQueries[options], variables: { input: { limit, cursor: 0, exclude } }, data })
                    this.setState({ fetching: null })
                    avgItemHeight = calcAvgItemHeight(lastElementChild, firstElementChild, children)
                })
            }
        }
    }
    render() {
        const { trending } = this.props.data
        const input = { cursor: 0, limit: 5, exclude: trending.results.map(post => post.id) }
        return (
            <div>
                <Trending posts={this.props.data.trending.results} />
                <br />
                <hr />
                <div className="container">
                    <div className="columns">

                        <Query query={SEARCH_POSTS} variables={{ input }} ssr={false}>
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
                                    <div onScroll={this.handleScroll('posts', client, { ...input, cursor: data.posts.cursor })} className="column is-two-thirds recent">
                                        <Recent data={data.posts} end={!data.posts.cursor} />
                                        {this.state.fetching === 'posts' && <article className="media">
                                            <div className="media-content font-2 has-text-centered">
                                                <div className="content has-text-centered">
                                                    <Loading size="4x" style="margin-top:2rem" />
                                                </div>
                                            </div>
                                        </article>}
                                    </div>
                                )
                            }}
                        </Query>

                    </div>
                </div>
                <style jsx>{`
                    .recent{
                        height: 90vh;
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
