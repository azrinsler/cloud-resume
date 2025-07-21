import * as React from "react";

const AboutBackend: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-backend-caption' className='about-technical-caption'>
            <h2>Backend</h2>
            <hr/>
            <div>
                <p>
                    The backend for this site has been kept <em>comparatively</em> simple in an effort to limit
                    scope creep, but it is still necessarily more complex than the frontend.
                </p>
                <br/>&nbsp;<br/>
                <p>
                    It consists of two lambda functions, which communicate with each other via an SQS queue. The
                    first function is written in Kotlin and uses the AWS Java SDK, which it imports using Maven.
                    This function sits behind an API Gateway and serves as the handler for REST API calls. The
                    other
                    function - written in Python - uses the AWS Python SDK (Boto3). Both functions interact with
                    DynamoDB, albeit for slightly different purposes:
                </p>
                <br/>&nbsp;<br/>

                <p>
                    The Kotlin lambda uses a Jackson wrapper to deserialize input coming from API Gateway, which
                    is expected to contain an IPv4 Address. This wrapper is imported as a utility from a
                    separate module in the project, which gets deployed to GitHub packages as a utility before
                    subsequently being imported into the lambda function itself as a version controlled
                    dependency. It then uses RegEx to perform some basic validation that the input IP is,
                    in fact, a valid address, before querying DynamoDB to check how many
                    times that particular IP address has loaded a page from the site. The response from
                    DynamoDB is parsed and used to generate a response indicating if and how many times the
                    IP address has been observed.
                </p>
                    <br/>&nbsp;<br/>
                <p>
                    At the same time, the Kotlin lambda also puts the message body from the API Gateway
                    event
                    onto an SQS queue feeding into the Python lambda. It returns immediately after sending
                    the
                    SQS message, so users do not have to wait on whatever additional processing happens
                    beyond
                    that point.
                </p>
                <p>
                    The Python lambda, on the other hand, is the one responsible for actually updating
                    DynamoDB.
                    The first time an IP is seen it will be added to DynamoDB with an initial visit counter
                    of
                    1, before returning a 201 - Created response stating the IP was added. Should the same
                    IP be
                    encountered additional times, the Python lambda simply increments the visit counter for
                    that
                    IP instead. When this happens, it instead returns a 200 - Successful response.
                    <br/>&nbsp;<br/>
                    Since the Python function is invoked asynchronously, its responses do not get sent back
                    to
                    the original user. They are visible in CloudWatch as logs, and help AWS determine if the
                    function was executed successfully or not.
                    <br/>&nbsp;<br/>
                    Should the Python function fail for any reason, it instead throws an exception, which
                    sends
                    the bad input back to SQS where it goes into a DLQ for manual remediation.
                </p>
                <br/>&nbsp;<br/>
                <p>
                    Both functions send their logger output to CloudWatch, which improves observability and
                    greatly
                    aids with any potential troubleshooting or debugging. They also both store their source code
                    in
                    S3 as packaged ZIP files containing all relevant dependencies. Terraform handles the upload
                    of
                    this packaged code. In the case of the Kotlin lambda, Maven is also used (to produce the
                    JAR).
                </p>
            </div>
        </div>
    )
}
export default AboutBackend