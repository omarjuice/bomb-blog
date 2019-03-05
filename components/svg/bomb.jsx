import React, { Component } from 'react';
import { svgAnimations } from '../../animations';

class BombSVG extends Component {
    componentDidMount() {
        if (this.props.animated) {
            svgAnimations.flare('.flare')
            svgAnimations.bounce('.bounce')
        } else if (this.props.flare) {
            svgAnimations.flare('.flare')
        } else if (this.props.bounce) {
            svgAnimations.bounce('.bounce')
        }

    }
    render() {
        const fill = this.props.lit ? '#3F3B3C' : 'lightgray'
        const scale = this.props.scale || 1
        return (<div >
            <svg id="bomb-svg" className={this.props.animated || this.props.bounce ? 'bounce' : ''} xmlns="http://www.w3.org/2000/svg" width={`${(scale) * 100}%`} height={`${(550 / 600) * 100 * (scale)}%`} viewBox="150 0 600 550"
                preserveAspectRatio="xMidYMid meet">

                <defs id="svgEditorDefs">
                    <path id="svgEditorClosePathDefs" style={{ stroke: 'orangered', strokeWidth: '8.24px', fill: 'darkorange' }} />
                    <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="rgrd2-white-blue" r="50%">
                        <stop stopColor="rgb(255,255,0)" offset="0%" style={{ stopColor: 'rgb(255, 255, 0)', stopOpacity: '1' }} />
                        <stop stopColor="rgb(255,132,0)" offset="100%" style={{ stopColor: 'rgb(255, 132, 0)', stopOpacity: '1' }} />
                    </radialGradient>
                </defs>
                <path d="M517.5898201205964,289.2215567559823a161.202093,161.202093,0,1,1,-122.60479009366566,-74.40119743113829Z"
                    style={{ fill, stroke: 'black', strokeWidth: '20px' }} id="e2_path" />
                <path d="M413.8473053892,204.3413173653" style={{ fill: 'none', stroke: 'black' }} strokeWidth="1.0479041916167664" id="e3_path" />
                <path d="M411.751497006,203.2934131737" style={{ fill: 'none', stroke: 'black' }} strokeWidth="1.0479041916167664" id="e4_path" />
                <ellipse id="e5_ellipse" cx="467.944" cy="238.744" style={{ fill, stroke: 'black', strokeWidth: '12px' }} rx="69.5346"
                    ry="36.9767" transform="matrix(0.845389 0.497306 -0.497306 0.845389 191.888 -201.226)" />
                <path d="M404.41616762126836,209.58083825825258l-16.766467065899974,32.485030048579006q-12.574850342698767,23.053892107127695,35.628742514976636,60.77844311386093q42.96407183459945,26.197604812025304,71.257485073358,12.57485032103557l25.149700598796926,-37.72455096332811q-47.67964083788593,7.8592812742217575,-74.92514968963667,-10.47904198128208q-31.96107779023714,-24.101796428881556,-39.29640726162245,-54.4910178989966Z"
                    style={{ fill, stroke: 'black', strokeWidth: '10px' }} id="e6_path" />
                <path d="M487.2005995653,254.6407093408q36.67664746600002,-70.2095822922,116.31736767799993,-58.682635945699985q-16.766467412999987,-29.3413179728,1.0479042133000576,-49.251498025800004q-113.17365503809998,-12.574850559799984,-160.32934463729998,83.8323370652q6.287425279899992,20.958084266300006,36.67664746605004,23.05389269291112Z"
                    style={{ fill: 'tan', stroke: 'black', strokeWidth: '8px' }} id="e7_path" />
                <ellipse id="e8_ellipse" cx="609.281" cy="171.857" style={{ fill: '#805929', stroke: 'black', strokeWidth: '6.75px' }} rx="13.4432"
                    ry="25.6662" />
                {this.props.lit ?
                    <g className="flare-g">
                        <polygon className={this.props.animated || this.props.flare ? 'flare' : ''} style={{ stroke: 'none', fill: 'url(#rgrd2-white-blue)', strokeWidth: '1px' }} id="e3_polygon"
                            points="583.795 58.2335 610.966 124.102 641.43 68.1138 634.843 132.335 664.484 113.398 649.663 147.979 709.768 135.629 644.723 172.68 719.648 188.323 648.84 192.44 685.891 227.021 635.666 210.554 643.076 261.602 609.319 213.024 593.675 283.009 584.618 216.317 545.921 248.428 578.031 203.144 517.103 213.847 566.505 182.56 492.403 156.213 573.091 156.213 501.46 102.695 596.145 134.805"></polygon>
                    </g>
                    : ''}

            </svg>
            {this.props.children}
            <style jsx>{`
                @keyframes spin{
                    from {
                        transform: rotate(0deg);
                    }
                    to{
                        transform: rotate(360deg);
                    }
                }
                `}</style>
        </div>
        );
    }
}

export default BombSVG;
