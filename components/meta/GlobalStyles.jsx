import React, { Component } from 'react';

class GlobalStyles extends Component {
    render() {
        return (
            <style jsx global>{`
                html{
                    background-color: whitesmoke
                }
                .font-1{
                    font-family: 'Coiny', sans-serif
                }
                .font-2{
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
            
                @media (max-width: 767px) {
                    .markdown-body {
                        padding: 15px;
                    }
                }
            `}</style>
        );
    }
}

export default GlobalStyles;
