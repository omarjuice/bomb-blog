import React, { Component } from 'react';
import Featured from './Featured'
import Recent from './Recent';
import { Query } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import Feed from './Feed';
import BombSVG from '../svg/bomb';
import { SEARCH_POSTS, AUTHENTICATED, CURRENT_USER_TAGS, FOLLOWEE_POSTS } from '../../apollo/queries';
import { renderModal } from '../../apollo/clientWrites';
import LoadingMedia from '../meta/LoadingMedia';
import { tabsAnimations } from '../../animations/index';

class Home extends Component {
    state = {
        tabs: false,
        fetching: false,
        active: 'featured'
    }
    handleScroll = (display, client, { limit, cursor, exclude, tags, orderBy }, query = SEARCH_POSTS) => {
        const input = { limit, cursor }
        if (tags) {
            input.tags = tags
        }
        else if (exclude || orderBy) {
            input.exclude = exclude
            input.orderBy = orderBy
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
                        console.log(e)
                        this.setState({ fetching: null })
                    }
                })
            }
        }
    }

    render() {
        const { trending } = this.props.data
        const inputTrending = { cursor: 0, limit: 5, exclude: trending.results.map(post => post.id), orderBy: "trending" }
        const inputSuggested = { cursor: 0, limit: 5, tags: [] }
        return (
            <div>
                {this.state.tabs ? <div className="tabs is-hidden-tablet is-toggle is-right">
                    <ul>
                        <li onClick={() => this.setState({ active: 'featured' })} className={this.state.active === 'featured' ? 'is-active' : ''}><a>Featured</a></li>
                        <li onClick={() => this.setState({ active: 'feed' })} className={this.state.active === 'feed' ? 'is-active' : ''}><a>Feed</a></li>
                        <li onClick={() => this.setState({ active: 'suggested' })} className={this.state.active === 'suggested' ? 'is-active' : ''}><a>Suggested</a></li>
                    </ul>
                </div> : ''}
                <a onClick={() => this.setState({ tabs: !this.state.tabs })} className="has-text-link tabs-toggle is-hidden-tablet" ><span className="icon is-large"><i className="fas fa-ellipsis-h fa-2x"></i></span></a>
                <Featured active={this.state.active === 'featured'} posts={this.props.data.trending.results} />
                <br />
                <hr className="is-hidden-mobile" />
                <div className="container">
                    <div className="columns is-tablet">
                        <Query query={AUTHENTICATED} ssr={false}>
                            {({ loading, error, data }) => {
                                if (loading || error || !data) {
                                    return (
                                        <div className="column is-two-thirds has-text-centered load-error">
                                            {loading && <Loading scale={5} />}
                                            {error && <ErrorIcon size="5x" />}
                                        </div>
                                    )
                                }
                                if (data.authenticated) return (
                                    <>
                                        <Query query={FOLLOWEE_POSTS} variables={{ limit: 5, cursor: 0 }} ssr={false}>
                                            {({ loading, error, data, client, startPolling, stopPolling }) => {
                                                if (data && data.user === undefined) {
                                                    startPolling(1000)
                                                }
                                                if (data && data.user === null) {
                                                    stopPolling()
                                                }
                                                if (loading || error || !data || !data.user) {

                                                    return (
                                                        <div className={`column is-two-thirds has-text-centered load-error ${this.state.active !== 'feed' && 'is-hidden-mobile'}`}>
                                                            {loading && <Loading scale={3} />}
                                                            {error && <ErrorIcon size="5x" />}
                                                        </div>
                                                    )
                                                }

                                                if (data.user) {
                                                    stopPolling()
                                                    return (
                                                        <div onScroll={this.handleScroll('feed', client, { cursor: data.user.followingPosts.cursor, limit: 5 }, FOLLOWEE_POSTS)} className={`column is-two-thirds recent box ${this.state.active !== 'feed' && 'is-hidden-mobile'}`}>
                                                            <article className="media">
                                                                <div className="media-content font-1 has-text-centered">
                                                                    <div className="content">
                                                                        <h1 className="title is-4">Feed</h1>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                            <Feed data={data.user.followingPosts} end={!data.user.followingPosts.cursor} />
                                                            {this.state.fetching === 'feed' && <LoadingMedia />}
                                                        </div>
                                                    )
                                                }
                                            }}
                                        </Query>
                                        <Query query={CURRENT_USER_TAGS} ssr={false} fetchPolicy={"network-only"}>
                                            {({ loading, error, data }) => {
                                                if (loading || error || !data || !data.user) {
                                                    return (
                                                        <div className={`column is-one-third has-text-centered load-error ${this.state.active !== 'suggested' && 'is-hidden-mobile'}`}>
                                                            {loading && <Loading scale={3} />}
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
                                                                    {loading && <Loading scale={3} />}
                                                                    {error && <ErrorIcon size="5x" />}
                                                                </div>
                                                            )
                                                        }
                                                        data.posts.results = data.posts.results.filter(post => !post.author.isMe)
                                                        return (
                                                            <div onScroll={this.handleScroll('posts', client, { ...inputSuggested, cursor: data.posts.cursor })} className={`column is-one-third recent box ${this.state.active !== 'suggested' && 'is-hidden-mobile'}`}>
                                                                <article className="media">
                                                                    <div className="media-content font-1 has-text-centered">
                                                                        <div className="content">
                                                                            <h1 className="title is-4">Suggested</h1>
                                                                        </div>
                                                                    </div>
                                                                </article>
                                                                <Recent data={data.posts} showTags={false} end={!data.posts.cursor} />
                                                                {this.state.fetching === 'posts' && <LoadingMedia />}
                                                            </div>
                                                        )
                                                    }}
                                                </Query>
                                            }}
                                        </Query>

                                    </>
                                )
                                if (!data.authenticated) return (
                                    <Query query={SEARCH_POSTS} variables={{ input: inputTrending }} ssr={false}>
                                        {({ loading, error, data, client }) => {
                                            if (loading || error || !data) {
                                                return (
                                                    <div className={`column is-two-thirds has-text-centered load-error ${this.state.active !== 'suggested' && 'is-hidden-mobile'}`}>
                                                        {loading && <Loading scale={3} />}
                                                        {error && <ErrorIcon size="5x" />}
                                                    </div>
                                                )
                                            }
                                            return (<>
                                                <div onScroll={this.handleScroll('posts', client, { ...inputTrending, cursor: data.posts.cursor })} className={`column is-two-thirds recent box ${this.state.active !== 'suggested' && 'is-hidden-mobile'}`}>
                                                    <article className="media">
                                                        <div className="media-content font-1 has-text-centered">
                                                            <div className="content">
                                                                <h1 className="title is-4">Recent</h1>
                                                            </div>
                                                        </div>
                                                    </article>
                                                    <Recent data={data.posts} showTags={true} end={!data.posts.cursor} />
                                                    {this.state.fetching === 'posts' && <LoadingMedia />}
                                                </div>
                                                <div className={`column is-one-third ${this.state.active !== 'feed' && 'is-hidden-mobile'}`}>
                                                    <div className="tile is-vertical has-text-centered font-1">
                                                        <div className="columns is-mobile">
                                                            <div className="column is-half">
                                                                <div className="has-text-centered">
                                                                    <BombSVG lit={true} flare={true} />
                                                                </div>
                                                            </div>
                                                            <div className="column login is-half">
                                                                <a className="subtitle is-4 has-text-link" onClick={() => renderModal({ active: true, display: 'Login' })}>Login</a>
                                                                <p className="subtitle is-4">OR</p>
                                                                <a className="subtitle is-4 has-text-link" onClick={() => renderModal({ active: true, display: 'Register' })}>Sign Up</a>
                                                                <p className="subtitle">To see your Feed</p>
                                                            </div>
                                                        </div>

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
                        background-color: #f9f9f9;
                        padding: 1rem;
                        -webkit-overflow-scrolling: touch;
                        z-index: 2;
                        margin-top: 2rem;
                    }
                    .load-error{
                        margin-top: 2rem;
                    }
                    hr {
                        height: 12px;
                        border: 0;
                        box-shadow: inset 0 12px 12px -12px rgba(0, 0, 0, 0.5);
                    }
                    .login{
                        margin-top: 2rem
                    }
                    .recent:nth-of-type(1){
                        margin-right: .5rem
                    }
                    .recent:nth-of-type(2){
                        margin-left: .5rem
                    }
                    .tabs-toggle, .tabs{
                        position: fixed;
                        top: 3.8rem;
                        z-index: 2;
                    }
                    .tabs{
                        background-color: #f0f0f0;
                        left: 0
                    }
                    .tabs-toggle{
                        right: 1rem;
                    }

                    `}</style>
            </div>
        );
    }
}

export default Home;
