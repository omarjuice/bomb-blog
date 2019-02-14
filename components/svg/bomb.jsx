import React, { Component } from 'react';

class BombSVG extends Component {

    render() {
        const fill = this.props.lit ? '#3F3B3C' : 'lightgray'
        const scale = this.props.scale || 1
        const secondaryColor = this.props.face && this.props.face.happy ? "#cc0000" : '#0fc5d9'
        return (<div className="has-text-centered">
            <svg id="bomb-svg" xmlns="http://www.w3.org/2000/svg" width={`${(scale) * 100}%`} height={`${(550 / 600) * 100 * (scale)}%`} viewBox="150 0 600 550"
                preserveAspectRatio="xMidYMid meet">

                <defs id="svgEditorDefs">
                    <path id="svgEditorClosePathDefs" style={{ stroke: 'orangered', strokeWidth: '8.24px', fill: 'darkorange' }} />
                    <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="rgrd2-white-blue" r="50%">
                        <stop offset="0%" style={{ stopColor: 'rgb(255, 255, 0)', stopOpacity: '1' }} />
                        <stop offset="100%" style={{ stopColor: 'rgb(255, 132, 0)', stopOpacity: '1' }} />
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
                {this.props.lit ? <path d="M611.9012102705,123.6526899238l30.389222186200072,-55.5389233058l-7.335329493199993,64.9700612256l29.341317972877164,-19.910180052920623l-14.67065898648957,34.5808390393008l61.82634858561232,-13.622754773080175l-68.11377386549998,38.77245589269998l75.44910335873055,15.718563199756517l-69.16167807886598,5.2395210666161915l36.67664746599223,34.58083903936168l-49.25149802574538,-16.76646741302926l6.287425279888566,50.299402239194876l-33.53293482610002,-48.20359381259999l-16.766467413097757,68.1137738655197l-8.38323370650221,-64.97006122551971l-38.77245589270922,30.389222186182224l31.437126399509225,-41.91616853268221l-60.77844437232045,7.335329493160486l51.347306452520456,-30.389222186060493l-72.30539071882077,-25.1497011196617l79.64072021202077,6.17035311734071e-11l-74.40119914542589,-53.44311487911547l94.31137919842587,31.437126399515464l-11.52694634650004,-77.54491178539999l27.245509546200083,66.0179654389Z"
                    style={{ fill: 'url(#rgrd2-white-blue)', stroke: 'none', strokeWidth: '4.32px', strokeLinejoin: 'miter', strokeLinecap: 'round' }}
                    id="e15_path" /> : ''}
                {this.props.face ? <> <ellipse id="e1_ellipse" cx="438.10343668076115" cy="321.6433026072141"
                    rx="34.995601654052734" ry="27.234399795532227" transform="matrix(1.04153 0.10108 -0.10108 1.04153 23.3606 20.1244)" style={{ stroke: 'none', fill: secondaryColor }} />
                    <ellipse id="e3_ellipse" cx="310.59814453125006" cy="347.06173706054693" style={{ stroke: 'none', fill: secondaryColor }}
                        rx="34.995601654052734" ry="27.234399795532227" transform="matrix(0.624166 0.829864 -0.829864 0.624166 426.452 -142.109)" />
                    {this.props.face.happy ?
                        <path d="M292.065868263473,380.8383233532935q13.47305389221549,113.02395209580828,135.4790419161676,78.59281437125742q-107.03592814371251,9.730538922155688,-135.4790419161676,-79.34131736526945ZM297.3053892215567,392.8143712574851"
                            style={{ fill: secondaryColor, strokeWidth: "8px", stroke: secondaryColor }} id="e11_path" transform="matrix(0.999981 0.00624458 -0.00624458 0.999981 2.65334 -2.23857)" />
                        :
                        <path d="M412.5748502994013,481.88622754491024q-39.67065868263484,-87.57485029940119,-133.98203592814372,-78.59281437125748q86.82634730538922,8.233532934131688,133.2335329341318,80.08982035928136Z"
                            style={{ fill: secondaryColor, strokeWidth: "8px", stroke: secondaryColor }} id="e9_path" />}
                </> : ''}
            </svg>
            {this.props.children}
        </div>
        );
    }
}

export default BombSVG;
