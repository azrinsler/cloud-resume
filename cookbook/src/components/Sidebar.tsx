import * as React from "react";
import {useEffect, useState} from "react";

import '../css/sidebar.css'

interface BasicLayoutProps extends React.PropsWithChildren {
    icon: React.ReactElement
    title: React.ReactElement
    content: React.ReactElement[]
    isExpanded?: boolean
}

const Sidebar: React.FC<BasicLayoutProps> = (props: BasicLayoutProps) => {
    const startOpen = props.isExpanded !== undefined ? props.isExpanded : localStorage.getItem("sidebarOpen") == "true" || localStorage.getItem("sidebarOpen") == undefined
    const [isOpen, setOpen] = useState(startOpen)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    // used to make the icon blip until it's been clicked the first time a user loads the page
    const [blip, setBlip] = useState( (localStorage.getItem("sidebarBlip") || "true") == "true" )
    const deactivateBlip = () => {
        setBlip(false)
        localStorage.setItem("sidebarBlip", "false")
    }
    // tracks whether the sidebar is open in local storage, which is used to prevent state from resetting on refresh
    useEffect(() => {
        localStorage.setItem("sidebarOpen", isOpen ? "true" : "false")
    }, [isOpen]);

    return (
        <div
            id='sidebar'
            className='flex-column'
            style={
                isOpen
                    ? isMobile
                        ? { width:'100vw', position:'absolute', overflow:'hidden' }
                        : { width:'200px', borderRight:'1px solid light-dark(#7905ff,#e883ff)' }
                    : isMobile
                        ? { width: '0', position:'absolute'}
                        : { width: '0', borderRight:'0px solid transparent' }
            }
        >
            <div
                className="flex-row-reversed"
                onClick={ ()=>{ setOpen(!isOpen); deactivateBlip() } }
            >
                <span
                    id="sidebar-toggle"
                    className='button text-outline'
                    style={
                        isOpen
                            ? { rotate:'90deg' }
                            : { rotate:'0deg', marginRight:'-1em' }
                }>&#9700;</span>
                { blip && !isOpen ? <span id='sidebar-blip' className='button text-outline'>&#9700;</span> : <></> }
            </div>

            <div
                id="sidebar-icon"
                className="flex-row"
                style={
                    isOpen
                        ? { opacity: '1' }
                        : { opacity: '0', display:'none' }
                }
            >
                {props.icon}
            </div>

            <div
                id="sidebar-content"
                className='flex-column'
                style={
                     isOpen
                         ? { textWrap:'nowrap',margin:'1em',placeContent:'center',placeItems:'center'}
                         : { textWrap:'nowrap',width:'0',color:'transparent' }
                }
            >
                <div className='flex-row'>
                    <h2>{props.title}</h2>
                </div>
                <hr style={{height:'0.15lh',width:'100%',backgroundColor:'aqua'}}/>
                <ul style={{listStyleType:'none', width:'100%'}}>
                    {
                        props.content.map( item=>
                            <li className='button'
                                key={'sidebarLi' + props.content.indexOf(item)}
                                onClick={()=>{setOpen(isMobile ? false : isOpen)}}
                            >
                                {item}
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}
export default Sidebar