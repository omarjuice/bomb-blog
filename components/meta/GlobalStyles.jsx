import React, { Component } from 'react';

class GlobalStyles extends Component {
    render() {
        return (
            <style jsx global>{`
                html{
                    background-color: #f0f0f0 !important;
                }
                .main-component{
                    height: 100%;
                }
                .font-1{
                    font-family: 'Baloo Thambi', sans-serif;
                }
                .hover-icon{
                    filter: brightness(80%);
                    -webkit-filter: brightness(80%);
                }
                .hover-icon:hover{
                    filter: brightness(100%);
                    -webkit-filter: brightness(100%);
                }
                .underline{
                    text-decoration: underline;
                }
                .primary-navbar{
                    z-index: 4
                }
                .secondary-navbar{
                    z-index: 2;
                    top: 3rem !important
                }
                #brand-img{
                    width: 80px !important
                }
                .markdown-body {
                    box-sizing: border-box;
                    min-width: 200px;
                    max-width: 980px;
                    margin: 0 auto;
                    padding: 45px;
                }
                .markdown-body.markdown-narrow{
                    box-sizing: border-box;
                    font-size: 50%;
                    min-width: 200px;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 0
                }
            
                @media (max-width: 767px) {
                    .markdown-body {
                        padding: 15px;
                    }
                }
                #panel-display{
                    position: relative;
                    top: -1.45rem;
                    height: 100vh;
                    overflow: scroll;
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>
        );
    }
}

export default GlobalStyles;
