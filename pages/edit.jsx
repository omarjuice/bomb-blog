import React, { Component } from 'react';
import { setSearch } from '../apollo/clientWrites';

class Edit extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    render() {
        return (
            <div>
                Edit post
            </div>
        );
    }
}

export default Edit;
