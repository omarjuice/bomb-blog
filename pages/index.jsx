import React, { Component } from 'react';
import Users from '../components/queries/auth/Users';
import gql from 'graphql-tag';
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

    render() {
        return (
            <div><Users /></div>
        );
    }
}


export default Index;
