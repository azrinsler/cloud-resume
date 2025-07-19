import * as React from "react";

import '../css/about.css'

const About : () => React.JSX.Element = () => {
    return (
        <div id='about' className='flex-column'>
            <h1 className='hatched-background' style={{borderBottom:'1px solid',textAlign:'center'}}>About</h1>
            <div id='about-content' className='flex-column'>
                Ipsum Lorem Some More ov em once again without end
            </div>
        </div>
    )
}
export default About