import * as React from "react";

const AboutNetwork: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-network-caption' className='about-technical-caption'>
            <h2>Networking</h2>
            <hr/>
            <div>

                <p>
                    To access any website, you need to — at some level — know its IP address. Asking users
                    to remember this address would, of course, be completely unreasonable, which is where DNS comes
                    into play. DNS is what maps between IP addresses and human-readable domain names.
                    <br />&nbsp;<br />
                    By default, Amazon makes it relatively quick and easy to statically host a website using S3; you
                    upload your files to a bucket marked for that purpose, make sure it's publicly readable,
                    and Amazon generates a URL for you. The URL it generates is based on the name of the bucket, so
                    you end up with something like <a href="http://azrinsler-site-bucket.s3-website-us-east-1.amazonaws.com/">http://azrinsler-site-bucket.s3-website-us-east-1.amazonaws.com/</a>.
                    <br />&nbsp;<br />
                    While certainly better than a "raw" IP address, there are still several problems with serving your
                    content through these. The foremost, as you may have noticed, is that the URL is http instead of
                    https — a security flaw. One serious enough that most browsers will warn users away from even
                    accessing the site in the first place! A secondary issue with this URL is that it is kind of long
                    and challenging to remember. We can address these issues using a combination of Route 53, ACM
                    (AWS Certificate Manager), and CloudFront.
                </p>
                <br />&nbsp;<br />
                <p>
                    ACM is the simplest and most straightforward of these three services, in that "all" it's doing is
                    providing us with the SSL certificate(s) we need in order to enable HTTPS. Each certificate we
                    make in ACM is for a specific root domain, and contains one or more CNAME (Canonical Name) DNS
                    records related to that domain. CNAME records by themselves do little besides map between
                    each other, and these particular CNAME(s) point to Amazon-owned records related to the validation
                    of our certificate. You need one record for the root domain name, and may need more for any
                    subdomains based on that root. The first and most obvious subdomain we will need is the "www"
                    one. It would also be convenient to have a subdomain for API access, so we create one for "api"
                    as well. Note that this certificate <em>does not</em> perform any routing, etc. for us by itself,
                    nor does it actually register the domain name we want it to use.
                </p>
                <br />&nbsp;<br />
                <p>
                    Amazon - through Route 53 - is a domain registrar. So we can use them to register the domain name
                    we want to use along with its corresponding TLD (top-level domain). The "com" TLD is both the
                    cheapest and most common option, and costs about $15/year to register through Amazon.
                    <br />&nbsp;<br />
                    Route 53 also provides us with the ability to additional DNS records of different types, which we
                    will need to do if we want our website to actually be found when somebody attempts to navigate to it.
                    To define these additional records, we need to first create a hosted zone within Route 53.
                    Hosted zones, by default, come with a few records of their own. This includes one for NS (name server)
                    and one for SOA (start of authority). You can read more about these <a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/SOA-NSrecords.html">here</a>.
                    <br />&nbsp;<br />
                    In addition to these, we will need a number of "A" records — these are how we connect our domain
                    to its IPv4 address. If we wanted to use IPv6, these would instead need to be "AAAA" records.
                    We could have them point directly to our site content in S3, but that by itself would not solve
                    for the original, primary issue with S3 (the lack of HTTPS).
                </p>
                <br />&nbsp;<br />
                <p>
                    For this, we need to use CloudFront. CloudFront provides a variety of different services, but
                    right now the one we're most interested in is the ability to redirect HTTP traffic to HTTPS. We
                    can achieve this by creating a new CloudFront distribution, and adding our S3 bucket as an
                    origin. Redirecting HTTP to HTTPS is one of the options we can select for its behavior. Easy enough!
                    <br />&nbsp;<br />
                    Much like the S3 bucket itself, Amazon gives our CloudFront distribution its own programmatically
                    generated URL. Something like <a href="https://dpqmp8uwwgxwd.cloudfront.net">https://dpqmp8uwwgxwd.cloudfront.net</a> which is... unfortunately
                    difficult to read, let alone remember. We can use Route 53 to solve this problem; to do so, we
                    must first update our CloudFront distribution to use the same name server(s) as Route 53,
                    which we can easily check using our NS record.
                </p>
                <br />&nbsp;<br />
                <p>
                    Now that we have a CloudFront distribution set up, we can finish defining records in Route 53.
                    To start with, we'll need "A" records which connect our registered domain (and subdomain) names
                    to whatever URL AWS gave to it. Since CloudFront is set to redirect HTTP to HTTPS, we will also
                    need to include our CNAME records from ACM. While these "A" and CNAME records serve different
                    purposes, in our case, we can treat them as pairs:
                </p>
                <br/>&nbsp;<br/>
                <ul>
                    <li>One pair for the root domain</li>
                    <li>One pair for the "www" subdomain</li>
                    <li>One pair for the "api" subdomain</li>
                </ul>
                <br />&nbsp;<br />
                <p>
                    With all of this set up, we should <em>finally</em> be able to access our website in S3 using
                    HTTPS and at a custom domain name of our choosing! That takes care of our root domain, as well
                    as the "www" subdomain. All that's left is to connect our "api" subdomain to an actual API.
                </p>
                <br />&nbsp;<br />
                <p>
                    To create an API through AWS, we'll use API Gateway. The actual specifics of how it works
                    are more of a backend implementation detail, but thankfully we can worry about that at a different time.
                    For now, we can simply create a custom domain (within API Gateway) using our subdomain name, and
                    update our "api" "A" record in Route 53 to point to it. Much like with CloudFront, the default
                    URL assigned to our custom domain in API gateway is largely unintelligible to a human reader,
                    so this record is the difference between users accessing your API at something like
                    <a href="https://api.azrinsler.com">api.azrinsler.com</a> vs.
                    <a href="https://d-37rxfs2ecj.execute-api.us-east-1.amazonaws.com">d-37rxfs2ecj.execute-api.us-east-1.amazonaws.com</a>.
                    <br />&nbsp;<br />
                    This custom domain is internally connected to a specific stage within an API Gateway API, but as
                    mentioned, that is more of an implementation detail. Each API implemented in this way will have
                    its own generated URL <em>in addition</em> to that of the custom domain. We can add that one to
                    the list of unintelligible URLs we could technically use, but prefer to avoid it due to
                    readability issues. For instance, the API stage used by this site is located at
                    <a href="https://gms9t124k8.execute-api.us-east-1.amazonaws.com/">https://gms9t124k8.execute-api.us-east-1.amazonaws.com/</a>.
                </p>
                <p>
                    Following all this setup, we have the following:
                </p>
                <br/>&nbsp;<br/>
                <ol>
                    <li>
                        Our primary domain, located at <a href="https://www.azrinsler.com">azrinsler.com</a>
                        <ul>
                            <li>This works with or without the "www" prefix</li>
                            <li>It automatically redirects HTTP traffic to HTTPS</li>
                            <li>Traffic going through CloudFront internally uses <a href="https://dpqmp8uwwgxwd.cloudfront.net">dpqmp8uwwgxwd.cloudfront.net</a></li>
                            <li>The S3 bucket the site originates from is located at <a href="http://azrinsler-site-bucket.s3-website-us-east-1.amazonaws.com">azrinsler-site-bucket.s3-website-us-east-1.amazonaws.com</a></li>
                        </ul>
                        <br/>&nbsp;<br/>
                    </li>
                    <li>
                        An API located at <a href="https://api.azrinsler.com">api.azrinsler.com</a>
                        <ul>
                            <li>When going through CloudFront, this only accepts HTTPS traffic</li>
                            <li>It points to a custom domain at <a href="https://d-37rxfs2ecj.execute-api.us-east-1.amazonaws.com">d-37rxfs2ecj.execute-api.us-east-1.amazonaws.com</a></li>
                            <li>The custom domain itself internally uses <a href="https://gms9t124k8.execute-api.us-east-1.amazonaws.com">gms9t124k8.execute-api.us-east-1.amazonaws.com/</a></li>
                        </ul>
                    </li>
                </ol>
            </div>
        </div>
    )
}
export default AboutNetwork