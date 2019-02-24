import React, { Component } from 'react';
import { getMatches, tagRegex } from '../utils';
import { setSearch, createError, renderModal, hideModal } from '../apollo/clientWrites';
import WritePost from '../components/writepost';
import { Query } from 'react-apollo';
import { AUTHENTICATED, GET_MODAL } from '../apollo/queries';
import Router from 'next/router'
import Loading from '../components/meta/Loading';
import ErrorIcon from '../components/meta/ErrorIcon';
import { CREATE_POST, UPLOAD_IMAGE } from '../apollo/mutations';

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
            const { title, caption, tags, body, image, imageType, upload } = form
            let insertTags = getMatches(tags, tagRegex)
            renderModal({ display: 'Confirm', info: { prompt: 'Are you ready submit this post?' }, active: true, confirmation: null })
            const { client } = this.props
            const page = this
            this.waitForConfirmation = client.watchQuery({ query: GET_MODAL })
                .subscribe({
                    async next(subscription) {
                        if (subscription.data.modal.confirmation === true) {
                            let imagePath;
                            if (imageType) {
                                const { data: { uploadImage } } = await client.mutate({ mutation: UPLOAD_IMAGE, variables: { image: upload.file } })
                                imagePath = uploadImage
                            } else {
                                imagePath = image
                            }
                            const { data } = await client.mutate({ mutation: CREATE_POST, variables: { input: { title, caption, tags: insertTags, post_content: body, image: imagePath } } })
                            if (data.createPost) {
                                page.waitForConfirmation.unsubscribe()
                                hideModal()
                                return Router.replace({ pathname: '/posts', query: { id: data.createPost.id } })
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
        return (
            <Query query={AUTHENTICATED} ssr={false}>
                {({ loading, error, data, client, refetch }) => {
                    if (loading) return <Loading />
                    if (error) return <ErrorIcon />
                    if (data.authenticated) return <WritePost onSubmit={this.onSubmit} />
                    if (!data.authenticated) {
                        renderModal({ display: 'Login', message: 'Login to write a post', confirmation: null, active: true })
                        const page = this
                        this.waitForConfirmation = client.watchQuery({ query: GET_MODAL })
                            .subscribe({
                                next({ data }) {
                                    if (data.modal.confirmation === true) {
                                        refetch({ query: AUTHENTICATED })
                                        page.waitForConfirmation.unsubscribe()
                                    }
                                    if (data.modal.confirmation === false) {
                                        createError({ code: 'UNAUTHENTICATED' })
                                        page.waitForConfirmation.unsubscribe()
                                        Router.back()
                                        return <div></div>
                                    }
                                },
                                error() {
                                    createError({ code: 'UNAUTHENTICATED' })
                                    page.waitForConfirmation.unsubscribe()
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

export default New;
