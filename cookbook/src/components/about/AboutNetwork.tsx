import * as React from "react";

const AboutNetwork: () => React.JSX.Element = () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    return (
        <div id='about-technical-network-caption' className='about-technical-caption'>
            <h2>Networking</h2>
            <hr/>

            <div className='flex-row' style={
                isMobile
                    ? {flexWrap:'wrap', padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}
                    : {flexWrap:'nowrap', padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}
            }>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>
                    <p>This project uses AWS to set up a custom HTTPS domain w/ corresponding api endpoint.</p>

                    <br />

                    <h4>Services involved</h4>
                    <ul>
                        <li>ACM (AWS Certificate Manager)</li>
                        <li>Route53</li>
                        <li>S3</li>
                        <li>CloudFront</li>
                        <li>API Gateway</li>
                    </ul>

                    <br />&nbsp;<br />

                    <h4>Summary of what they are used for</h4>
                    <ul>
                        <li>S3 is used to store our frontend files as well as statically host them as a React app</li>
                        <li>Route53 serves as the domain registrar (for the purchase the TLD)</li>
                        <li>Route53 is also where DNS records for our custom domain(s) are configured</li>
                        <li>ACM to create SSL certificate(s), which are used to enable HTTPS</li>
                        <li>CloudFront is our cache as well as how we redirect HTTP to HTTPS automatically</li>
                        <li>API Gateway is - unsurprisingly - how we provide API access</li>
                    </ul>

                    <br/>&nbsp;<br/>
                </div>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>
                    <h3>Following all this setup, we have the following:</h3>
                    <br/>
                    <h4>Our primary domain, located at <a href="https://www.azrinsler.com">azrinsler.com</a></h4>
                    <ul>
                        <li>This works with or without the "www" prefix</li>
                        <li>It automatically redirects HTTP traffic to HTTPS</li>
                        <li>Traffic going through CloudFront internally uses <a href="https://d1xja2t1oot2dp.cloudfront.net">https://d1xja2t1oot2dp.cloudfront.net</a></li>
                        <li>The S3 bucket the site originates from is located at <a href="http://azrinsler-cookbook.s3-website-us-east-1.amazonaws.com">http://azrinsler-cookbook.s3-website-us-east-1.amazonaws.com</a></li>
                    </ul>
                    <br/>&nbsp;<br/>
                    <h4>An API located at <a href="https://api.azrinsler.com">api.azrinsler.com</a></h4>
                    <ul>
                        <li>When going through CloudFront, this only accepts HTTPS traffic</li>
                        <li>It points to a custom domain at <a href="https://d-esiwtzndbe.execute-api.us-east-1.amazonaws.com">https://d-esiwtzndbe.execute-api.us-east-1.amazonaws.com</a></li>
                        <li>The custom domain itself internally uses <a href="https://1che7w3kdk.execute-api.us-east-1.amazonaws.com">https://1che7w3kdk.execute-api.us-east-1.amazonaws.com</a></li>
                    </ul>
                </div>
            </div>

        </div>
    )
}
export default AboutNetwork