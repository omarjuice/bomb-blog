import React, { Component } from 'react';
import { setSearch } from '../apollo/clientWrites';
import NewPost from '../components/NewPost';

class New extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    render() {
        return (
            <NewPost />
        );
    }
}

export default New;
