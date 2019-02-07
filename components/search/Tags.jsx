import React, { Component } from 'react';
import BomgSVG from '../svg/bomb';

class Tags extends Component {
    render() {
        const { data } = this.props
        return (
            <>
                {data.results.map(({ id, tag_name }) => {
                    return (
                        <article key={id} className="media has-text-centered">
                            <div className="media-content">
                                <div className="content">
                                    <a className="tag">{tag_name}</a>
                                </div>
                            </div>
                        </article>
                    )
                })}
                {this.props.end ? <article className="media">
                    <figure className="media-left">
                        <div className="image is-64x64">
                            <BomgSVG lit={false} face={{ happy: false }} />
                        </div>
                    </figure>
                    <div className="media-content font-2 has-text-centered">
                        <div className="content has-text-centered">
                            <h3 className="subtitile is-3">
                                No Tags to show...
                        </h3>

                        </div>
                    </div>
                </article> : ''}
            </>

        );
    }
}

export default Tags;
