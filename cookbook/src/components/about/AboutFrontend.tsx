import * as React from "react";

const AboutFrontend: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-frontend-caption' className='about-technical-caption'>
            <h2>Frontend</h2>
            <hr/>
            <div>
                    <p>
                        The frontend for this site is relatively straightforward. It is written in a mixture of
                        HTML,
                        CSS, and JS. All site files are stored in the same bucket in S3. While S3 does not
                        necessarily
                        have folders in the same way a directory structure usually works, the keys used for these
                        files mimic the existing directory structure in a way that works much the same.
                    </p>
                    <br/>&nbsp;<br/>
                    <p>
                        The site also uses images of several formats, including PNG, JPG, and PDF, and the Terraform
                        script which handles uploading them automatically selects the correct MIME type, based on
                        their
                        file extension.
                    </p>
                    <br/>&nbsp;<br/>
                    <p>
                        Though the site files are stored in S3, most viewers will not access them directly. Instead,
                        they will go through a CloudFront distribution, which caches site files at geographically
                        disparate edge locations, to speed up access to them.
                    </p>
            </div>
        </div>
    )
}
export default AboutFrontend