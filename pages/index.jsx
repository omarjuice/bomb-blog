import React, { Component } from 'react';
import { setSearch } from '../apollo/clientWrites';
import Home from '../components/home';
import { TRENDING } from '../apollo/queries';
class Index extends Component {
    static pageTransitionDelayEnter = true
    static async getInitialProps({ apolloClient }) {
        setSearch({ active: false })
        const trending = await apolloClient.query({ query: TRENDING, variables: { input: { limit: 5, orderBy: "trending", featured: true } } })
        return {
            data: {
                trending: trending.data.posts
            },

        }

    }
    componentDidMount() {
        this.props.pageTransitionReadyToEnter()
    }

    render() {
        return (
            <Home data={this.props.data} />
        )
    }
}


export default Index;
