import React, { Component } from 'react';
import moment from 'moment'
import marked from 'marked'
import Link from 'next/link';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber, getMatches } from '../../utils';
import FeaturePost from '../admin/FeaturePost';
class Featured extends Component {
    shorten = (text, maxLen = 100) => {
        if (text.length > maxLen) {
            return text.split(' ').reduce((acc, word) => {
                if (acc.totalLen < maxLen) {
                    acc.totalLen += word.length
                    acc.text += word + ' '
                }
                return acc
            }, { totalLen: 0, text: '' }).text + '...'
        }
        return text
    }
    genMedia = (post, size = 'large') => {
        return (
            <article className="media">
                <figure className="media-left">
                    <p className={`image ${size === 'large' ? 'is-48x48' : 'is-32x32'}`}>
                        <img src={post.author.profile.photo_path || '/static/user_image.png'} alt="" />
                    </p>
                </figure>
                <div className="media-content">
                    <div className="content">
                        <p>
                            <Link href={{ pathname: '/profile', query: { id: post.author.id } }}>
                                <a >
                                    {post.author.username}
                                </a>
                            </Link>
                            <br />
                            <small>{moment.utc(Number(post.created_at)).local().fromNow()}</small>
                            <br />
                            <small>{Math.ceil(getMatches(post.post_content, /\w+/g).length / 200)} min read</small>
                        </p>
                    </div>
                </div>
            </article>
        )
    }
    genTags = (post) => {
        return (
            <>
                {post.tags.slice(0, 10).map((tag, i) => (
                    <a onClick={() => setSearch({ addToInput: ` #${tag.tag_name}`, active: true })} key={tag.id} className={`tag font-2 ${i % 2 === 0 ? 'is-primary' : 'is-info'}`}>{tag.tag_name}</a>
                ))}
                {post.tags.length > 10 ? <div className="tag">...</div> : ''}
            </>
        )
    }
    genStats = (post, size = 'large') => {
        return (
            <>
                <a onClick={() => renderModal({ active: true, display: 'Likers', info: { type: 'post', id: post.id } })} className="has-text-weight-bold has-text-primary"><span className={`icon ${size === 'large' ? 'is-large' : ''}`}><i className={`fas fa-bomb ${size === 'large' ? 'fa-2x' : ''}`}></i></span>{shortenNumber(post.numLikes)}</a>
                <p className="has-text-weight-bold has-text-info"><span className={`icon ${size === 'large' ? 'is-large' : ''}`}><i className={`fas fa-comment ${size === 'large' ? 'fa-2x' : ''}`}></i></span>{shortenNumber(post.numComments)}</p>
                <FeaturePost featured={post.featured} id={post.id} />
            </>
        )
    }
    render() {
        const { posts } = this.props
        return (<div>
            <div className={`container ${this.props.active ? '' : 'is-hidden-mobile'}`}>
                <div className="tile is-ancestor">
                    <div className="tile is-parent">
                        {posts[0] ? <article className="tile is-child">
                            <Link href={{ pathname: '/posts', query: { id: posts[0].id } }}>
                                <a>
                                    <p className="title is-4 font-2">{this.shorten(posts[0].title)}</p>
                                    <p className="subtitle is-6">{this.shorten(posts[0].caption, 200)}</p>
                                </a>
                            </Link>
                            <div className="columns is-multiline is-mobile">
                                <div className="column is-half-mobile is-full-tablet">
                                    {posts[0].image ? <Link href={{ pathname: '/posts', query: { id: posts[0].id } }}>
                                        <a >
                                            <figure className="image is-4by3">
                                                <img src={posts[0].image} alt="image" />
                                            </figure>
                                        </a>
                                    </Link> : ''}

                                </div>
                                <div className="column is-half-mobile is-full-tablet">
                                    {this.genTags(posts[0])}
                                </div>
                                <div className="column is-one-third stats">

                                    {this.genStats(posts[0])}
                                </div>

                                <div className="column is-two-thirds">
                                    {this.genMedia(posts[0])}
                                </div>
                            </div>
                        </article> : ''}
                    </div>
                    <div className="tile is-vertical is-8">
                        <div className="tile is-parent">
                            {posts[1] ? <article className="tile is-child">
                                <div className="columns is-multiline is-mobile">
                                    <div className="column is-three-quarters-desktop is-full-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[1].id } }}>
                                            <a>
                                                <p className="title is-4 font-2">{this.shorten(posts[1].title)}</p>
                                                <p className="subtitle is-6">{this.shorten(posts[1].caption, 200)}</p>
                                            </a>
                                        </Link>
                                        <div className="columns is-mobile is-multiline">
                                            {posts[1].image ? <div className="column is-half is-hidden-tablet">
                                                <Link href={{ pathname: '/posts', query: { id: posts[1].id } }}>
                                                    <a >
                                                        <figure className="image is-4by3">
                                                            <img src={posts[1].image} alt="image" />
                                                        </figure>
                                                    </a>
                                                </Link>
                                            </div> : ''}
                                            <div className="column is-5-desktop is-full-tablet is-half-mobile">
                                                {this.genTags(posts[1])}
                                            </div>
                                            <div className="column is-2-desktop is-one-third-mobile stats">
                                                {this.genStats(posts[1])}
                                            </div>
                                            <div className="column is-5-desktop is-two-thirds-mobile">
                                                {this.genMedia(posts[1])}
                                            </div>

                                        </div>
                                    </div>
                                    {posts[1].image ? <div className="column is-one-quarter is-hidden-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[1].id } }}>
                                            <a >
                                                <figure className="image is-4by3">
                                                    <img src={posts[1].image} alt="image" />
                                                </figure>
                                            </a>
                                        </Link>
                                    </div> : ''}
                                </div>
                            </article> : ''}
                        </div>
                        <div className="tile">

                            <div className="tile is-parent">
                                {posts[2] ? <article className="tile is-child">
                                    <div className="columns is-multiline is-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[2].id } }}>
                                            <a className="column is-full">
                                                <p className="title is-4 font-2">{this.shorten(posts[2].title)}</p>
                                                <p className="subtitle is-6">{this.shorten(posts[2].caption, 200)}</p>
                                            </a>
                                        </Link>
                                        {posts[2].image ? <Link href={{ pathname: '/posts', query: { id: posts[2].id } }}>
                                            <a className="column is-half">

                                                <figure className="image is-4by3">
                                                    <img src={posts[2].image} alt="image" />
                                                </figure>
                                            </a>
                                        </Link> : ''}

                                        <div className="column is-half">
                                            {this.genTags(posts[2])}
                                        </div>
                                        <div className="column is-one-third stats">
                                            {this.genStats(posts[2])}
                                        </div>
                                        <div className="column is-two-thirds">
                                            {this.genMedia(posts[2])}
                                        </div>
                                    </div>

                                </article> : ''}
                            </div>
                            <div className="tile is-parent">
                                {posts[3] ? <article className="tile is-child">
                                    <div className="columns is-multiline is-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[3].id } }}>
                                            <a className="column is-full">
                                                <p className="title is-4 font-2">{this.shorten(posts[3].title)}</p>
                                                <p className="subtitle is-6">{this.shorten(posts[3].caption, 200)}</p>
                                            </a>
                                        </Link>
                                        {posts[3].image ? <Link href={{ pathname: '/posts', query: { id: posts[3].id } }}>
                                            <a className="column is-half">

                                                <figure className="image is-4by3">
                                                    <img src={posts[3].image} alt="image" />
                                                </figure>
                                            </a>
                                        </Link> : ''}



                                        <div className="column is-half">
                                            {this.genTags(posts[3])}
                                        </div>
                                        <div className="column is-one-third stats">
                                            {this.genStats(posts[3])}
                                        </div>
                                        <div className="column is-two-thirds">
                                            {this.genMedia(posts[3])}
                                        </div>
                                    </div>

                                </article> : ''}
                            </div>
                        </div>
                        {/* <div className="tile is-parent">
                            <article className="tile is-child">
                                <div className="columns is-multiline is-mobile">
                                    <div className="column is-three-quarters-desktop is-full-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[4].id } }}>
                                            <a>
                                                <p className="title is-4 font-2">{this.shorten(posts[4].title)}</p>
                                                <p className="subtitle is-6">{this.shorten(posts[4].caption, 200)}</p>
                                            </a>
                                        </Link>

                                        <div className="columns is-mobile is-multiline">
                                            <div className="column is-half is-hidden-tablet">
                                                <Link href={{ pathname: '/posts', query: { id: posts[4].id } }}>
                                                    <a >
                                                        <figure className="image is-4by3">
                                                            <img src={posts[4].image} alt="image" />
                                                        </figure>
                                                    </a>
                                                </Link>

                                            </div>
                                            <div className="column is-6-desktop is-full-tablet is-half-mobile">
                                                {this.genTags(posts[4])}
                                            </div>
                                            <div className="column is-2-desktop is-one-third-mobile stats">
                                                {this.genStats(posts[4])}
                                            </div>
                                            <div className="column is-4-desktop is-two-thirds-mobile">
                                                {this.genMedia(posts[4])}
                                            </div>

                                        </div>
                                    </div>
                                    <div className="column is-one-quarter is-hidden-mobile">
                                        <Link href={{ pathname: '/posts', query: { id: posts[4].id } }}>
                                            <a >
                                                <figure className="image is-4by3">
                                                    <img src={posts[4].image} alt="image" />
                                                </figure>
                                            </a>
                                        </Link>

                                    </div>

                                </div>
                            </article>
                        </div> */}

                    </div>

                </div>

            </div>
            <style jsx>{`

                .title{
                    hyphens: auto
                }
                .media .media-content .content{
                    word-break: break-all
                }
                .stats{
                    margin-top: -1rem;
                }
                .subtitle{
                    margin: 1rem auto
                }
 
                article.tile{
                    padding: 1rem;
                    background-color: white;
                    border-radius: 1rem;
                    box-shadow: 1px 1px 1px lightgray
                }

                `}</style>
        </div>

        );
    }
}

export default Featured;
