import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { USER_PROFILE } from '../../apollo/queries';
import { UPLOAD_IMAGE, UPDATE_PROFILE } from '../../apollo/mutations';

const update = (proxy, { data: { updateProfile } }) => {
    const id = updateProfile.user_id
    const data = proxy.readQuery({ query: USER_PROFILE, variables: { id } })
    data.user.profile = updateProfile
    proxy.writeQuery({ query: USER_PROFILE, variables: { id }, data })
}

class UploadImage extends Component {
    state = {
        valid: false,
        fileName: '',
        file: null,
        delete: false
    }
    onChange = ({ target: { validity, files: [file] } }) => {
        this.setState({
            valid: validity.valid,
            fileName: file ? file.name : null,
            file,
            delete: false
        })
        this.props.setPreviewImage(file)
    }
    onSubmit = (uploadImage, client) => {
        return async e => {
            const image = this.state.file
            e.preventDefault()
            if (image && this.state.valid) {
                const { data } = await uploadImage({ variables: { image, type: 'profile' } })
                if (data && data.uploadImage) {
                    const photo_path = data.uploadImage
                    await client.mutate({ mutation: UPDATE_PROFILE, variables: { input: { photo_path } }, update })
                    this.props.cancelEdit()
                }
            } else if (this.state.delete) {
                const photo_path = null
                await client.mutate({ mutation: UPDATE_PROFILE, variables: { input: { photo_path } }, update })
                this.props.cancelEdit(this.props.original)
            } else {
                this.props.cancelEdit(this.props.original)
            }
        }
    }
    reset = () => {
        this.setState({
            valid: false,
            fileName: '',
            file: null,
            delete: true
        })
        this.props.setPreviewImage(null)
    }
    getText = () => {
        if (this.state.delete) {
            return 'Delete your image?'
        }
        if (!this.state.fileName) {
            return 'Choose an image'
        }
        if (!this.state.valid && this.state.fileName) {
            return 'Invalid Image'
        }
        if (this.state.valid && this.state.fileName) {
            return 'Do you like it?'
        }
    }
    render() {
        return (
            <Mutation mutation={UPLOAD_IMAGE}>
                {(uploadImage, { error, loading, client }) => {
                    return (
                        <form onSubmit={this.onSubmit(uploadImage, client)} className="has-text-centered">
                            <div className="field has-addons has-addons-centered has-text-centered">
                                <div className="control">
                                    <div className="file is-dark is-centered">
                                        <label className="file-label">
                                            <input className="file-input" type="file" name="image" accept=".jpeg,.jpg,.png"
                                                onChange={this.onChange} />
                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    {loading ? <i className="fas fa-cog fa-spin"></i> : error ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-upload"></i>}
                                                </span>
                                                <span className="file-label">
                                                    {this.getText()}
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                {this.state.delete || this.state.file ? <div className="field has-text-centered">
                                    <div className="control has-text-centered">
                                        <button type="submit" className="button is-link">
                                            <span className="icon"><i className="fas fa-check"></i></span>
                                        </button>
                                    </div>
                                </div> : ''}
                                <div onClick={this.reset} className="field has-text-centered">
                                    <div className="control has-text-centered">
                                        <a className="button is-primary">
                                            <span className="icon"><i className="fas fa-trash-alt"></i></span>
                                        </a>
                                    </div>
                                </div>
                            </div>


                        </form>

                    )
                }}
            </Mutation>
        );
    }
}

export default UploadImage;
