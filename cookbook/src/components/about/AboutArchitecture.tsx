import * as React from "react";

const AboutArchitecture: () => React.JSX.Element = () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    return (
        <div id='about-technical-architecture-caption' className='about-technical-caption flex-column'>
            <h2>High Level Architecture</h2>

            <h2 style={{color:'darkgoldenrod',backgroundColor:'light-dark(#6c5da1,#732e54)'}}>This simple website is the result of a complex project.</h2>
            <h4 style={{color:'goldenrod',textAlign:'center'}}>Under the hood, it's a serverless, microservice-based web-app built in AWS using multiple languages.</h4>

            <br/>&nbsp;<br/>

            <div className='flex-row' style={
                    isMobile
                        ? {flexWrap:'wrap', padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}
                        : {flexWrap:'nowrap', padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}
            }>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>
                    <h3>Frontend</h3>
                    <ul>
                        <li>Written in React JS using Typescript/HTML/CSS</li>
                    </ul>

                    <br/>&nbsp;<br/>

                    <h3>Backend</h3>
                    <ul>
                        <li>Lambdas written in multiple languages including Kotlin/Java and Python</li>
                        <li>DynamoDb and S3 for storage</li>
                        <li>SQS for messaging</li>
                        <li>Observable in CloudWatch via OpenTelemetry</li>
                    </ul>

                    <br/>&nbsp;<br/>
                </div>
                <div style={isMobile ? {width:'100%'} : {width:'50%'}}>
                    <h3>Networking</h3>
                    <ul>
                        <li>CloudFront + Route53 w/ ACM for HTTPS to custom domain</li>
                        <li>ApiGateway endpoint(s) provide access to backend lambdas</li>
                    </ul>

                    <br/>&nbsp;<br/>

                    <h3>DevOps</h3>
                    <ul>
                        <li>Fully automated build and deploy processes based on GitHub Actions workflows</li>
                        <li>Uses Terraform w/ Maven for IaC</li>
                        <li>GitHub Packages as artifact repository</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default AboutArchitecture