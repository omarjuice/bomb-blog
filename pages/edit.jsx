import React, { Component } from 'react';
import { setSearch, createError } from '../apollo/clientWrites';
import { AUTHENTICATED, CURRENT_USER, POST } from '../apollo/queries';
import Router from 'next/router'
import { Query } from 'react-apollo';
import Loading from '../components/meta/Loading';
import ErrorIcon from '../components/meta/ErrorIcon';
import WritePost from '../components/writepost/index';
import { UPDATE_POST } from '../apollo/mutations';
import { updateTags, getMatches, tagRegex } from '../utils';

class Edit extends Component {
    static async getInitialProps({ apolloClient, query, res }) {
        setSearch({ active: false })
        const redirect = () => {
            createError({ code: 'NOT FOUND', message: 'Post was not found' })
            res.writeHead(302, { Location: `/` })
            return res.end()
        }
        if (!query.id) {
            return redirect()
        }
        const { data } = await apolloClient.query({ query: POST, variables: { id: Number(query.id) } })
        if (!data) {
            return redirect()
        }
        return { data }
    }
    onSubmit = (validate) => {
        let processingSubmit = false
        const { client } = this.props
        return async function (e) {
            e.preventDefault()
            if (processingSubmit) return
            const form = validate()
            if (!form) return;
            processingSubmit = true
            const { title, caption, tags, body } = form
            let newTags = getMatches(tags, tagRegex)
            let modTags = updateTags(this.props.data.post.tags.map(tag => tag.tag_name), newTags)
            console.log(modTags)
            const { data } = await client.mutate({ mutation: UPDATE_POST, variables: { id: this.props.data.post.id, input: { title, caption, modTags, post_content: body } } })
            if (data.updatePost) {
                const oldData = client.cache.readQuery({ query: POST, variables: { id: data.updatePost.id } })
                client.cache.writeQuery({ query: POST, variables: { id: data.updatePost.id }, data: { ...oldData, ...data.updatePost } })
                return Router.replace({ pathname: '/posts', query: { id: data.updatePost.id } })
            }
        }.bind(this)
    }
    render() {
        const { post } = this.props.data
        return (
            <Query query={AUTHENTICATED} ssr={false} >
                {({ loading, error, data }) => {
                    if (loading) return <Loading />
                    if (error) return <ErrorIcon />
                    if (data.authenticated) return (
                        <Query query={CURRENT_USER}>
                            {({ loading, error, data }) => {
                                if (loading) return <Loading />
                                if (error) return <ErrorIcon />
                                if (!data) {
                                    createError({ code: 'UNAUTHENTICATED' })
                                    Router.replace('/')
                                    return <div></div>
                                }
                                if (data.user.id === post.author.id) {
                                    return <WritePost title={post.title} caption={post.caption} tags={post.tags.reduce((acc, tag) => acc + '#' + tag.tag_name + ' ', '')} body={post.post_content} onSubmit={this.onSubmit} />
                                }
                                createError({ code: 'UNAUTHORIZED', message: 'You did not write that post.' })
                                Router.replace('/')
                                return <div></div>

                            }}
                        </Query>
                    )
                    createError({ code: 'UNAUTHENTICATED' })
                    Router.replace('/')
                    return <div></div>
                }}
            </Query>
        );
    }
}

export default Edit;
