import * as React from "react";

const AboutDevOps: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-devops-caption' className='about-technical-caption'>

            <h2>DevOps</h2>
            <div className='flex-column' style={{padding:'1em', backgroundColor:'light-dark(white,#0f080c)', border:'1px solid'}}>
                <p>
                    This project leverages the following:
                </p>
                <ul>
                    <li>GitHub Actions</li>
                    <li>GitHub Packages</li>
                    <li>Maven</li>
                    <li>Terraform</li>
                </ul>
                <br/>&nbsp;<br/>
                <p>
                    By using these tools together, we can create a cohesive build process which quietly handles many of the common pain points surrounding CI/CD.
                    GitHub Actions and Packages are, of course, tightly coupled to GitHub itself, which is where the codebase already resides.
                    By using these, we can avoid the additional setup and maintenance involved in alternative tools, such as Jenkins or JFrog/Artifactory.
                    <br/>&nbsp;<br/>
                    Maven greatly simplifies dependency management in addition to being a powerful build tool in its own right.
                    A custom settings.xml file allows Maven to retrieve dependencies from GitHub packages without exposing credentials.
                    <br/>&nbsp;<br/>
                    Being that this is an AWS-based project, Cloudformation would typically be the go-to option for IaC. So why Terraform?
                    Well, mostly because Terraform is open-source and vendor-agnostic.
                    To avoid any additional cost or dependency on Hashicorp themselves, this project stores its state in S3.
                </p>
            </div>
        </div>
    )
}
export default AboutDevOps