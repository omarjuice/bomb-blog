import React, { Component } from 'react';
import Link from 'next/link';
import UnlikePost from '../posts/UnlikePost';
import LikePost from '../posts/LikePost';
import moment from 'moment'
import { Query } from 'react-apollo';
import { SEARCH_POSTS } from '../../apollo/queries';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
import BomgSVG from '../svg/bomb';


class Posts extends Component {
    state = {
        fetchMore: false
    }
    render() {
        const { data, input } = this.props
        const nextInput = { ...input, cursor: data.cursor }
        if (data.results.length === 0) {
            return (
                <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BomgSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-2 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No Posts to show...
                        </h3>

                        </div>
                    </div>

                </article>
            )
        }
        return (
            <>
                {data.results.map(({ id, title, author, created_at, last_updated, numLikes, numComments, caption, iLike, tags }) => {
                    return (
                        <article key={id} className="media has-text-centered">
                            <figure className="media-left">
                                <p className="image is-48x48">
                                    <img src={author.profile.photo_path || "/static/user_image.png"} />
                                </p>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <Link href={{ pathname: '/posts', query: { id } }}><a><strong className="font-2">{title} </strong></a></Link>
                                        <br />
                                        {caption}
                                        <br />
                                        By
                                        <Link href={{ path: '/profile', query: { id: author.id } }}>
                                            <a><strong className="font-2"> {author.username} </strong></a>
                                        </Link>
                                        <br />
                                        {tags.map((tag, i) => (
                                            <span key={tag.id} className={`tag font-2 ${i % 2 === 0 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</span>
                                        ))}
                                        <br />
                                        <small>
                                            <a><span className="icon has-text-primary has-text-weight-bold"><i className="fas fa-heart"></i>{`${numLikes}`}</span></a> · <a>
                                                <span className="icon has-text-weight-bold has-text-info"><i className="fas fa-comments"></i> {numComments}</span></a> · {moment.utc(Number(created_at)).local().format('MMMM Do YYYY')}
                                        </small>
                                    </p>
                                </div>
                            </div>
                            <div className="media-right columns is-multiline is-mobile is-centered">
                                <div className="column is-half has-text-centered">
                                    {iLike ? <UnlikePost size="2x" postId={id} /> : <LikePost size="2x" postId={id} />}
                                </div>
                            </div>
                        </article>
                    )
                })}
                {!this.state.fetchMore ?
                    <article className="media">
                        <div className="media-content font-2 has-text-centered">
                            <div className="content has-text-centered">
                                <button onClick={() => this.setState({ fetchMore: true })} className="button is-large is-primary font-2">More</button>

                            </div>
                        </div>

                    </article>
                    :
                    <Query query={SEARCH_POSTS} variables={{ input: nextInput }}>
                        {({ loading, error, data }) => {
                            if (loading) return <Loading />;
                            if (error) return <ErrorIcon />
                            return <Posts data={data.posts} input={nextInput} />
                        }}
                    </Query>
                }
            </>
        )
    }
}

export default Posts;
