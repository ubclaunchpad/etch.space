import React, { Component } from 'react';
import config from '../config';

class Knob extends Component {
    render() {
        return (
            <svg
                id={this.props.id}
                className="knob"
                style={{
                     transform: `rotate(${this.props.rotation}deg)`   
                }}
                width="61px"
                height="61px"
                viewBox="0 0 61 61"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
            
            >
                <title>Oval</title>
                <desc>Created with Sketch.</desc>
                <defs>
                    <circle id="path-1" cx="30.0743918" cy="30.0743918" r="30.0743918"></circle>
                    <mask id="mask-2" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="60.1487836" height="60.1487836" fill="white">
                        <use xlinkHref="#path-1"></use>
                    </mask>
                </defs>
                <g id="Page-1" strokeWidth="1" fillRule="evenodd">
                    <use id="Oval" mask="url(#mask-2)" strokeWidth="14" xlinkHref="#path-1"></use>
                </g>
                </svg>            
        ) 
    }
}

export default Knob;