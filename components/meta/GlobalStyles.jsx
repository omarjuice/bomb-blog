import React, { Component } from 'react';

class GlobalStyles extends Component {
    render() {
        return (
            <style jsx global>{`
                *{
                    touch-action: manipulation;
                }
                *::-webkit-scrollbar { width: 0 !important }
                * { overflow: -moz-scrollbars-none; }
                *  { -ms-overflow-style: none; }
                html{
                    background-color: #f0f0f0 !important;
                }

                .main-component{
                    height: 100%;
                }
                .font-1{
                    font-family: 'Baloo Bhaijaan', sans-serif;
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
                input[type="color"],
                input[type="date"],
                input[type="datetime"],
                input[type="datetime-local"],
                input[type="email"],
                input[type="month"],
                input[type="number"],
                input[type="password"],
                input[type="search"],
                input[type="tel"],
                input[type="text"],
                input[type="time"],
                input[type="url"],
                input[type="week"],
                select:focus,
                textarea {
                    font-size: 16px;
                }
                @media only screen and (max-width: 767px) {
                    .markdown-body {
                        padding: 0px;
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
