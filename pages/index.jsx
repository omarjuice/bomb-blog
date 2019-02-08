import React, { Component } from 'react';

import BombSVG from '../components/svg/bomb';
import { setSearch } from '../apollo/clientWrites';
class Index extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    componentDidMount() {
    }

    render() {
        return (
            // <div><Users /></div>
            <>
                <BombSVG />
            </>
        );
    }
}


export default Index;
