import React, { Component } from 'react';
import Link from 'next/link'
import { renderModal } from '../../apollo/clientWrites';
class LinkWrap extends Component {
    render() {
        const { profile, post, href, toggleModal, comments } = this.props
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


        if (post) {
            let query = {}
            query.id = post.id
            if (comments) query.comments = true
            return (
                <Link as={`/posts/${post.title.replace(/\s/g, '-')}?id=${post.id}${comments ? '&comments=true' : ''}`} href={{ pathname: '/posts', query }}>
                    {children}
                </Link>
            )
        }
    }
}

export default LinkWrap;
