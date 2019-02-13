import React, { Component } from 'react';
import { setSearch, createError, renderModal, hideModal } from '../apollo/clientWrites';
import { AUTHENTICATED, CURRENT_USER, POST, GET_MODAL } from '../apollo/queries';
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
        const { data } = await apolloClient.query({ query: POST, variables: { id: Number(query.id) }, fetchPolicy: "network-only" })
        if (!data) {
            return redirect()
        }
        return { data }
    }
    onSubmit = (validate) => {
        let processingSubmit = false
        const { client, data: { post: { id } } } = this.props
        return async function (e) {
            e.preventDefault()
            if (processingSubmit) return
            const form = validate()
            if (!form) return;
            processingSubmit = true
            const { title, caption, tags, body, image } = form
            let newTags = getMatches(tags, tagRegex)
            let modTags = updateTags(this.props.data.post.tags.map(tag => tag.tag_name), newTags)
            renderModal({ display: 'Confirm', info: { prompt: 'Are you ready submit these edits?' }, active: true, confirmation: null })
            const page = this
            this.waitForConfirmation = client.watchQuery({ query: GET_MODAL })
                .subscribe({
                    async next(subscription) {
                        if (subscription.data.modal.confirmation === true) {
                            const { data } = await client.mutate({ mutation: UPDATE_POST, variables: { id, input: { title, caption, modTags, post_content: body, image } } })
                            if (data.updatePost) {
                                const oldData = client.cache.readQuery({ query: POST, variables: { id } })
                                const newData = { post: { ...oldData.post, ...data.updatePost } }
                                client.cache.writeQuery({ query: POST, variables: { id }, data: newData })
                                page.waitForConfirmation.unsubscribe()
                                return Router.replace({ pathname: '/posts', query: { id } })
                            }
                        }
                        if (subscription.data.modal.confirmation === false) {
                            page.waitForConfirmation.unsubscribe()
                            hideModal()
                        }
                    }
                })

        }.bind(this)
    }
    componentWillUnmount() {
        this.waitForConfirmation = null
    }
    render() {
        const { post } = this.props.data
        return (
            <Query query={AUTHENTICATED} ssr={false} >
                {({ loading, error, data, client, refetch }) => {
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
                                    return <WritePost image={post.image} title={post.title} caption={post.caption} tags={post.tags.reduce((acc, tag) => acc + '#' + tag.tag_name + ' ', '')} body={post.post_content} onSubmit={this.onSubmit} />
                                }
                                createError({ code: 'UNAUTHORIZED', message: 'You did not write that post.' })
                                Router.replace('/')
                                return <div></div>

                            }}
                        </Query>
                    )
                    if (!data.authenticated) {
                        renderModal({ display: 'Login', message: 'Login to edit this post', confirmation: null, active: true })
                        const page = this
                        this.waitForConfirmation = client.watchQuery({ query: GET_MODAL })
                            .subscribe({
                                next({ data }) {
                                    if (data.modal.confirmation === true) {
                                        refetch({ query: AUTHENTICATED })
                                        page.waitForConfirmation = null
                                    }
                                    if (data.modal.confirmation === false) {
                                        page.waitForConfirmation = null
                                        createError({ code: 'UNAUTHENTICATED' })
                                        Router.back()
                                        return <div></div>
                                    }
                                },
                                error() {
                                    page.waitForConfirmation = null
                                    createError({ code: 'UNAUTHENTICATED' })
                                    Router.back()
                                    return <div></div>
                                }
                            })
                        return <Loading />
                    }
                }}
            </Query>
        );
    }
}

export default Edit;
