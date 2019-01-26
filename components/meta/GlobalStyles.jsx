import React, { Component } from 'react';

class GlobalStyles extends Component {
    render() {
        return (
            <style jsx global>{`
            
                .navbar{
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0
                }
            `}</style>
        );
    }
}

export default GlobalStyles;
