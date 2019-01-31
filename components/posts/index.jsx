import React, { Component } from 'react';
import Link from 'next/link';
import { Query } from 'react-apollo';
import { POST } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import moment from 'moment'
import Comments from './Comments';
import Unfollow from '../global/UnFollow';
import Follow from '../global/Follow';
import Like from '../global/Like';
class PostPage extends Component {
    state = {
        comments: false
    }
    toggleComments = () => {
        this.setState({
            comments: !this.state.comments
        })
    }
    render() {
        return (
            <div className="main-component">
                <Link href="/">
                    <a>home</a>
                </Link>
                <Query query={POST} variables={{ id: Number(this.props.id) }}>
                    {({ loading, error, data }) => {
                        if (loading || error) return (
                            <div className="columns is-centered">
                                <div className="load-error column is-one-third has-text-centered">
                                    {loading && <Loading size="10x" color="primary" />}
                                    {error && <ErrorIcon size="10x" />}
                                </div>

                            </div>
                        )
                        const { id, user_id, author, title, caption, post_content, created_at, last_updated, tags, numLikes, numComments, iLike } = data.post
                        return (<div className="columns is-centered is-mobile is-multiline">
                            <div className="column is-7-desktop is-10-tablet is-full-mobile">
                                <div className="card article">
                                    <div className="card-content">
                                        <div className="media">
                                            <div className="media-center">
                                                <img src={author.profile.photo_path || `/static/user_image.png`} className="author-image" alt={`${author.username}'s picture`} />
                                            </div>
                                            <div className="media-content has-text-centered">
                                                <p className="title is-1 article-title font-2">{title}</p>
                                                <div className="caption content is-size-3">
                                                    <div className="columns is-mobile is-centered">
                                                        <div className="column is-1"><i className="fas fa-quote-left fa-pull-left"></i></div>
                                                        <div className="column is-9">{caption}</div>
                                                        <div className="column is-1"><i className="fas fa-quote-right fa-pull-left"></i></div>
                                                    </div>

                                                </div>
                                                <hr />
                                                <div className="columns is-mobile is-centered is-multiline">
                                                    <div className="column is-2"></div>
                                                    <div className="column is-2 has-text-centered">
                                                        <Like postId={id} size="3x" />
                                                        <br />
                                                        <p className="is-size-4 font-1">{numLikes}</p>
                                                    </div>

                                                    <div className="column is-6">
                                                        <div className="subtitle is-6 article-subtitle">
                                                            <Link href={{ pathname: '/profile', query: { id: user_id } }}><a>@{author.username}</a></Link>
                                                            <br />
                                                            at {moment.utc(Number(created_at)).local().format(' h:mma on MMMM Do, YYYY')}
                                                            <br />
                                                            {!!last_updated && `last updated: ${moment.utc(Number(last_updated)).local().format(' h:mma on \n MMMM Do, YYYY')}`}
                                                            {author.imFollowing ? <Unfollow userId={user_id} /> : <Follow userId={user_id} />}
                                                        </div>
                                                    </div>
                                                    <div className="column is-8-desktop is-full-mobile">
                                                        {<div className="tags">
                                                            {tags.map((tag, i) => {
                                                                return <a key={tag.id} className={`tag is-rounded font-2 is-medium ${i % 2 === 1 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</a>
                                                            })}
                                                        </div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content article-body">
                                            {post_content}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="column is-6-desktop is-8-tablet is-12-mobile">
                                <div className="box has-text-centered">
                                    <a onClick={this.toggleComments}>
                                        <span className="icon is-large">
                                            <span className="fa-stack fa-lg">
                                                <i className="fas fa-comment fa-stack-2x has-text-info"></i>
                                                <i className={`fas fa-ellipsis-h fa-stack-1x ${this.state.comments ? 'has-text-white' : ''}`}></i>
                                            </span>
                                        </span>
                                    </a>
                                    {this.state.comments ? <Comments id={id} /> : <h1 className="title is-4 font-1">Comments: {numComments}</h1>}
                                </div>
                            </div>

                        </div>
                        )
                    }}
                </Query>
                <style jsx>{`     
                    .author-image {
                        position: absolute;
                        top: -30px;
                        left: 50%;
                        width: 60px;
                        height: 60px;
                        margin-left: -30px;
                        border: 3px solid #ccc;
                        border-radius: 50%;
                        box-shadow: 0px 1px 1px gray
                    }
                    .media-center {
                        display: block;
                        margin-bottom: 1rem;
                    }
                    .media-content {
                        margin-top: 3rem;
                        overflow: visible
                    }
                    .article {
                        margin-top: 6rem;
                    }
                    .article-subtitle {
                        color: #909AA0;
                        margin-bottom: 3rem;
                    }
                    .article-body {
                        line-height: 1.4;
                    }
                    .box{
                        margin-top: 5rem
                    }
                    .load-error{
                        margin-top: 40vh
                    }
                `}</style>
            </div>
        );
    }
}

export default PostPage;