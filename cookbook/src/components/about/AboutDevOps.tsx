import * as React from "react";

const AboutDevOps: () => React.JSX.Element = () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    return (
        <div id='about-technical-devops-caption' className='about-technical-caption'>
            <h2>DevOps</h2>
            <hr/>
            <div className='flex-row' style={ isMobile ? {flexWrap:'wrap'} : {flexWrap:'nowrap'}}>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>

                </div>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>

                </div>
            </div>
        </div>
    )
}
export default AboutDevOps