import * as React from "react";

const AboutFrontend: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-frontend-caption' className='about-technical-caption'>
            <h2>Frontend</h2>
            <div className='flex-column' style={{padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}}>
                <p>
                    The frontend for this site is relatively straightforward. It uses React and is written in a mixture
                    of JS/TS and HTML/CSS. All site files are stored in the same bucket in S3.
                </p>
                <br/>&nbsp;<br/>
                <p>
                    Though the site files are stored in S3, most viewers will not access them directly. Instead,
                    they will go through a CloudFront distribution, which caches site files at edge locations.
                </p>
            </div>
        </div>
    )
}
export default AboutFrontend