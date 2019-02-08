import React, { Component } from 'react';
import NoSSR from 'react-no-ssr';
import { setSearch } from '../apollo/clientWrites';
import NewPost from '../components/NewPost';

class New extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    render() {
        return (
            <NoSSR>
                <NewPost />
            </NoSSR>
        );
    }
}

export default New;
