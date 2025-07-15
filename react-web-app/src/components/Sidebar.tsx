import * as React from "react";
import {useState} from "react";

interface BasicLayoutProps extends React.PropsWithChildren {
    icon: React.ReactElement
    title: React.ReactElement
    content: React.ReactElement[]
    isExpanded?: boolean
}

const Sidebar: React.FC<BasicLayoutProps> = (props: BasicLayoutProps) => {
    const startOpen = props.isExpanded !== undefined ? props.isExpanded : false
    const [isOpen, setOpen] = useState(startOpen)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    return (
        <div
            id='sidebar'
            className='flex-column'
            style={
                isOpen
                    ? isMobile
                        ? { width:'100vw', position:'absolute' }
                        : { width:'200px' }
                    : isMobile
                        ? { width: '0', position:'absolute'}
                        : { width: '0' }
            }
        >
            <div
                className="flex-row-reversed"
                onClick={ ()=>setOpen(!isOpen) }
            >
                <span
                    id="sidebar-toggle"
                    className='button'
                    style={
                        isOpen
                            ? { rotate:'90deg' }
                            : { rotate:'0deg',marginRight:'-1em' }
                }>&#9700;</span>
            </div>

            <div
                id="sidebar-icon"
                className="flex-row"
                style={
                    isOpen
                        ? { opacity: '1' }
                        : { opacity: '0' }
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
                <ul style={{ listStyleType:'none', width:'100%'}}>
                    {
                        props.content.map( item=>
                            <li className='button' key={'sidebarLi' + props.content.indexOf(item)}>{item}</li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}
export default Sidebar