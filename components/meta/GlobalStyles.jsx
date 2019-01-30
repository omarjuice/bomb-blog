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
                .navbar{
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0
                }
                .hover-icon{
                    filter: brightness(80%);
                    -webkit-filter: brightness(80%);
                }
                .hover-icon:hover{
                    filter: brightness(100%);
                    -webkit-filter: brightness(100%);
                }
            `}</style>
        );
    }
}

export default GlobalStyles;
