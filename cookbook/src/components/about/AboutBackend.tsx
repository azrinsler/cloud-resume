import * as React from "react";

const AboutBackend: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-backend-caption' className='about-technical-caption'>
            <h2>Backend</h2>
            <hr/>
            <div>
                <p>The backend is based on a number of AWS services including SQS, Lambda, Dynamo DB, Cloud Watch, and API Gateway</p>

                <br/>&nbsp;<br/>

                <p>Lambda functions serve as intermediaries between API Gateway and Dynamo DB.</p>

                <br/>&nbsp;<br/>

                <p>For simple cases they do so directly, while more complex cases get routed through SQS to other Lambda-based microservices.</p>

                <br/>&nbsp;<br/>

                <p>
                    While there is no direct need for them to be this way, different Lambdas have been written using
                    different languages in order to demonstrate the flexibility of the architecture.
                </p>

                <br/>&nbsp;<br/>

                <p>
                    Some Lambdas also make use of an ADOT (AWS Distribution for Open Telemetry) Layer to enable
                    additional telemetry in CloudWatch.
                </p>

                <br/>&nbsp;<br/>

                <p>Languages used include Kotlin, Python, and Java</p>
            </div>
        </div>
    )
}
export default AboutBackend