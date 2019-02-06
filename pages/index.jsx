import React, { Component } from 'react';

import BomgSVG from '../components/svg/bomb';
class Index extends Component {
    static async getInitialProps() {
        return {}

    }
    componentDidMount() {
    }

    render() {
        return (
            // <div><Users /></div>
            <>
                <BomgSVG />
            </>
        );
    }
}


export default Index;
