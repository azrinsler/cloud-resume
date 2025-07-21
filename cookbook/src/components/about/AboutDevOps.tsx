import * as React from "react";

const AboutDevOps: () => React.JSX.Element = () => {
    return (
        <div id='about-technical-devops-caption' className='about-technical-caption'>
            <h2>DevOps</h2>
            <hr/>
            <div>
                <p>
                    Build automation, DevOps, Lean, CI/CD, IaC (Infrastructure as Code)... these terms are often used somewhat interchangeably.
                    They are highly related concepts that - broadly speaking - focus on the speed, quality, and consistency of your build and development processes.
                    Much like QE, DevOps is frequently overlooked or deprioritized in favor of more visible and pressing aspects of software development,
                    with the consequences of doing so only becoming clear at a late stage. Why is that?
                </p>
                <br/>&nbsp;<br/>
                <p>
                    There are, of course, a myriad of possible reasons, but I would argue that most of them fall into one of these categories:
                </p>
                <ul>
                    <li>DevOps is its own skill set involving a different tech stack, which developers are not necessarily familiar with.</li>
                    <li>Automation in general is heavily front-loaded in terms of effort, which makes it <em>painful</em> to set up.</li>
                    <li>The benefits are frequently invisible — it's hard to appreciate the value of a seamless deployment if you haven't experienced the pain of a botched one.</li>
                </ul>
                <br/>&nbsp;<br/>
                <p>
                    The fact is, having a highly automated build process is of absolutely foundational importance to all but the smallest of projects.
                </p>
                <br/>&nbsp;<br/>
                <p>
                    This project leverages the following:
                </p>
                <ul>
                    <li>GitHub Actions — Build Automation</li>
                    <li>GitHub Packages — Artifact Storage</li>
                    <li>Maven — Dependency Management</li>
                    <li>Terraform — IaC</li>
                </ul>
                <br/>&nbsp;<br/>
                <p>
                    By using these tools together, we can create a cohesive build process which quietly handles many of the common pain points surrounding CI/CD.
                    GitHub Actions and Packages are, of course, tightly coupled to GitHub itself, which is where the codebase already resides.
                    By using these, we can avoid the additional setup and maintenance involved in alternative tools, such as Jenkins or JFrog/Artifactory.
                    <br/>&nbsp;<br/>
                    Maven greatly simplifies dependency management in addition to being a powerful build tool in its own right.
                    A custom settings.xml file allows Maven to retrieve dependencies from GitHub packages without exposing credentials.
                    I could have just as easily used Gradle for this same purpose, and mostly went with Maven out of personal preference.
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