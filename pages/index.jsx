import React, { Component } from 'react';

import Authenticated from '../components/auth/Authenticated';
class Index extends Component {
    static async getInitialProps({ apolloClient }) {
        // const result = await apolloClient.query({
        //     query: gql`
        //     {
        //         users{
        //             id
        //             username
        //         }
        //     }
        //     `
        // })
        // console.log(result)
        // return {}
        return {}

    }
    componentDidMount() {
    }

    render() {
        return (
            // <div><Users /></div>
            <>
                <Authenticated />

            </>
        );
    }
}


export default Index;
