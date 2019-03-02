import React, { Component } from 'react';
import Link from 'next/link'
import { renderModal } from '../../apollo/clientWrites';
class LinkWrap extends Component {
    render() {
        const { profile, post, href, toggleModal } = this.props
        const children = toggleModal ?
            <a onClick={() => renderModal({ active: false })} >
                {this.props.children}
            </a> :
            this.props.children
        if (href) return (
            <Link href={href}>
                {children}
            </Link>
        )
        if (profile) return (
            <Link as={`/profile/${profile.username}?id=${profile.id}`} href={{ pathname: '/profile', query: { id: profile.id } }}>
                {children}
            </Link>
        )
        if (post) return (
            <Link as={`/posts/${post.title.replace(/\s/g, '-')}?id=${post.id}`} href={{ pathname: '/posts', query: { id: post.id } }}>
                {children}
            </Link>
        )
    }
}

export default LinkWrap;
