import React, { Component } from 'react';
import moment from 'moment'
import Link from 'next/link';
import Trending from './Trending'
import Recent from './Recent';
import { setSearch, renderModal } from '../../apollo/clientWrites';
import { shortenNumber } from '../../utils';

class Home extends Component {

    render() {
        return (
            <div>
                <Trending posts={this.props.data.trending.results} />
                <br />
                <hr />
                <div className="container">
                    <div className="columns">
                        <div className="column is-two-thirds">
                            <Recent cursor={this.props.data.recent.cursor} results={this.props.data.recent.results} />
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    hr {
                        height: 12px;
                        border: 0;
                        box-shadow: inset 0 12px 12px -12px rgba(0, 0, 0, 0.5);
                    }
                    `}</style>
            </div>
        );
    }
}

export default Home;
