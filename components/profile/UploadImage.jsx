import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Loading from '../meta/Loading';
import ErrorIcon from '../meta/ErrorIcon';
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
        file: null
    }
    onChange = ({ target: { validity, files: [file] } }) => {
        this.setState({
            valid: validity.valid,
            fileName: file.name,
            file
        })
        this.props.setPreviewImage(file)
    }
    onSubmit = (uploadImage, client) => {
        return async e => {
            const image = this.state.file
            if (!image) return
            e.preventDefault()
            const { data } = await uploadImage({ variables: { image } })
            if (data && data.uploadImage) {
                const photo_path = data.uploadImage
                await client.mutate({ mutation: UPDATE_PROFILE, variables: { input: { photo_path } }, update })
                this.props.cancelEdit()
            }
        }
    }
    render() {
        return (
            <Mutation mutation={UPLOAD_IMAGE}>
                {(uploadImage, { loading, error, data, client }) => {
                    if (error) { console.log(error); }
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
                                                    {loading ? <Loading /> : error ? <ErrorIcon /> : <i className="fas fa-upload"></i>}
                                                </span>
                                                <span className="file-label">
                                                    {!this.state.fileName ? 'Choose an image' : ''}
                                                    {!this.state.valid && this.state.fileName ? 'Invalid image' : ''}
                                                    {this.state.valid && this.state.fileName ? <span>Do you like it?</span> : ''}
                                                </span>
                                            </span>


                                        </label>
                                    </div>
                                </div>
                                {this.state.valid && this.state.fileName ? <div className="field has-text-centered">
                                    <div className="control has-text-centered">
                                        <button type="submit" className="button is-primary">
                                            <span className="icon"><i className="fas fa-check"></i></span>
                                        </button>
                                    </div>
                                </div> : ''}
                            </div>


                        </form>

                    )
                }}
            </Mutation>
        );
    }
}

export default UploadImage;
