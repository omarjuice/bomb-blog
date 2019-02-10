import React, { Component } from 'react';
import NoSSR from 'react-no-ssr';
import { setSearch } from '../apollo/clientWrites';
import WritePost from '../components/writepost';
import { Query } from 'react-apollo';
import { AUTHENTICATED } from '../apollo/queries';
import Router from 'next/router'
import Loading from '../components/meta/Loading';
import ErrorIcon from '../components/meta/ErrorIcon';
import { CREATE_POST } from '../apollo/mutations';
import { getMatches, tagRegex } from '../utils';

class New extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    onSubmit = (validate) => {
        let processingSubmit = false
        return async function (e) {
            e.preventDefault()
            if (processingSubmit) return
            const form = validate()
            if (!form) return;
            processingSubmit = true
            const { title, caption, tags, body } = form
            let insertTags = getMatches(tags, tagRegex)
            const { data } = await this.props.client.mutate({ mutation: CREATE_POST, variables: { input: { title, caption, tags: insertTags, post_content: body } } })
            if (data.createPost) {
                return Router.replace({ pathname: '/posts', query: { id: data.createPost.id } })
            }
        }.bind(this)
    }
    render() {
        return (
            <NoSSR>
                <Query query={AUTHENTICATED} ssr={false}>
                    {({ loading, error, data }) => {
                        if (loading) return <Loading />
                        if (error) return <ErrorIcon />
                        if (data.authenticated) return <WritePost onSubmit={this.onSubmit} />
                        Router.push('/')
                        return <div></div>

                    }}
                </Query>
            </NoSSR>
        );
    }
}

export default New;
