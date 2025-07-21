import * as React from 'react';

import '../../css/about.css'

import AboutTechnical from "./AboutTechnical.tsx";

import architectureDiagram from '../../assets/diagrams/architecture.drawio.png'
import frontendDiagram from '../../assets/diagrams/frontend.drawio.png'
import backendDiagram from '../../assets/diagrams/backend.drawio.png'
import networkDiagram from '../../assets/diagrams/networking.drawio.png'
import devopsDiagram from '../../assets/diagrams/devops.drawio.png'

import AboutArchitecture from "./AboutArchitecture.tsx";
import AboutFrontend from "./AboutFrontend.tsx";
import AboutBackend from "./AboutBackend.tsx";
import AboutNetwork from "./AboutNetwork.tsx";
import AboutDevOps from "./AboutDevOps.tsx";

import {useState} from "react";

const About : () => React.JSX.Element = () => {
    const [activeTab, setActiveTab] = useState('simple')

    const getTab = (tab: string) => {
        switch (tab) {
            case 'simple':
                return (
                    <>
                        This is a simple cookbook for simple recipes - no backstory, no anecdotes, no fluff or filler.
                        <br/>&nbsp;<br/>
                        Just. Recipes.
                        <br/>&nbsp;<br/>
                        Simple though this cookbook may be, it is the result of a complicated and technical process!
                        <br/>
                        If you're interested in learning more, feel free to switch to the 'Technical' tab for some decidedly NOT simple details.
                    </>
                )
            case 'technical':
                return <AboutTechnical
                    images={[
                        <img id='about-technical-architecture-diagram' src={architectureDiagram} alt={'architecture diagram'} className='about-technical-img'></img>,
                        <img id='about-technical-frontend-diagram' src={frontendDiagram} alt={'frontend diagram'} className='about-technical-img'></img>,
                        <img id='about-technical-backend-diagram' src={backendDiagram} alt={'backend diagram'} className='about-technical-img'></img>,
                        <img id='about-technical-network-diagram' src={networkDiagram} alt={'network diagram'} className='about-technical-img'></img>,
                        <img id='about-technical-devops-diagram' src={devopsDiagram} alt={'devops diagram'} className='about-technical-img'></img>,
                    ]}
                    captions={[
                        <AboutArchitecture></AboutArchitecture>,
                        <AboutFrontend></AboutFrontend>,
                        <AboutBackend></AboutBackend>,
                        <AboutNetwork></AboutNetwork>,
                        <AboutDevOps></AboutDevOps>
                    ]}
                ></AboutTechnical>
            default:
                return (
                    <div>Unknown Tab</div>
                )
        }
    }

    return (
        <div id='about' className='flex-column'>
            <h1 className='hatched-background' style={{textAlign:'center'}}>About</h1>
            <div className='flex-row' style={{paddingTop:'0.5em',borderBottom:'1px solid',flexWrap:'nowrap'}}>
                <div id='about-simple-tab' onClick={()=>{setActiveTab('simple')}} style={activeTab == 'simple' ? {backgroundColor:'light-dark(#637fe3,#210012)'} : {}}>
                    <input type='radio' name='about-tab' id='about-simple-radio-input' value='simple' defaultChecked={true} />
                    <label htmlFor='about-simple-radio-input'>Simple</label>
                </div>
                <div id='about-technical-tab' onClick={()=>{setActiveTab('technical')}} style={activeTab == 'technical' ? {backgroundColor:'light-dark(#637fe3,#210012)'} : {}}>
                    <input type='radio' name='about-tab' id='about-technical-radio-input' value='technical'/>
                    <label htmlFor='about-technical-radio-input'>Technical</label>
                </div>
            </div>
            <div id='about-content' className='flex-column'>
                { getTab(activeTab) }
            </div>
        </div>
    )
}
export default About