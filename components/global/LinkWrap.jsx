import React, { Component } from 'react';
import Link from 'next/link'
import { renderModal } from '../../apollo/clientWrites';
class LinkWrap extends Component {
    render() {
        return (
            <Link href={this.props.href}>
                <a onClick={() => renderModal({ active: false })} >
                    {this.props.children}
                </a>
            </Link>
        );
    }
}

export default LinkWrap;
