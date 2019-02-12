import React, { Component } from 'react';
import { DELETE_POST } from '../../apollo/mutations';
import { renderModal, hideModal } from '../../apollo/clientWrites';
import { GET_MODAL, USER_POSTS, POST } from '../../apollo/queries';
import Router from 'next/router';
import { Mutation } from 'react-apollo';

const update = (id, userId) => {
    return proxy => {
        try {
            const data = proxy.readQuery({ query: USER_POSTS, variables: { id: userId } })
            data.user.posts = data.user.posts.filter(post => post.id !== id)
            proxy.writeQuery({ query: USER_POSTS, variables: { id: userId }, data })
            proxy.data.delete(`Post:${id}`)
        } catch (e) {
            console.log(e);
        }
    }
}

class DeletePost extends Component {
    handleClick = (deletePost, client) => {
        return e => {
            e.preventDefault()
            renderModal({ active: true, confirmation: null, display: 'Confirm', info: { prompt: 'Are you sure you want to delete this post?' } })
            const { id, userId } = this.props
            const component = this
            this.waitForConfirmation = client.watchQuery({ query: GET_MODAL })
                .subscribe({
                    async next({ data }) {
                        if (data.modal.confirmation === true) {
                            await deletePost({ variables: { id } })
                            component.waitForConfirmation.unsubscribe()
                            hideModal()

                            return Router.back()
                        }
                        if (data.modal.confirmation = false) {
                            component.waitForConfirmation.unsubscribe()
                            hideModal()
                        }
                    }
                })
        }
    }
    render() {
        return (
            <Mutation mutation={DELETE_POST} update={update(this.props.id, this.props.userId)}>
                {(deletePost, { client }) => {
                    return (
                        <button onClick={this.handleClick(deletePost, client)} className="button is-warning is-large"><span className="icon"><i className="fas fa-trash-alt"></i></span></button>
                    )
                }}
            </Mutation>
        );
    }
}

export default DeletePost;
