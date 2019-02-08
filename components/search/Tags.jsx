import React, { Component } from 'react';
import moment from 'moment'
import BomgSVG from '../svg/bomb';
import { setSearch } from '../../apollo/clientWrites';
class Tags extends Component {
    render() {
        const { data } = this.props
        return (
            <>
                {data.results.map(({ id, tag_name, popularity, created_at }, i) => {
                    return (
                        <article key={id} className="media has-text-centered">
                            <div className="media-content">
                                <div className="content has-text-centered">
                                    <div className={`tag is-large font-2 ${this.props.inputTags.includes(tag_name) ? 'is-primary' : 'is-info'}`}>{tag_name}</div>
                                    <BomgSVG scale={.1} lit={true} >{popularity}</BomgSVG>
                                    <small>Created {moment.utc(Number(created_at)).local().fromNow()}</small>
                                </div>
                            </div>
                            <div className="media-right columns is-multiline is-mobile is-centered">
                                <div className="column is-half has-text-centered">
                                    <a onClick={() => setSearch({ addToInput: ` #${tag_name}`, active: true })} className="has-text-dark"><span className="icon is-large"><i className="fas fa-search fa-2x"></i></span></a>
                                </div>
                            </div>
                            <style jsx>{`
                                small{
                                    margin-top: -1rem;
                                }
                                .media-right{
                                    position: relative;
                                    top: 2rem
                                }
                                `}</style>
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
