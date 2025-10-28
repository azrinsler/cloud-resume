import * as React from "react";
import resume from '../../assets/resume/resume.pdf'

const Resume: () => React.JSX.Element = () => {
    return (
        <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',flexGrow:'1'}}>
            <iframe src={resume} style={{width:'100%',height:'100%'}}></iframe>
        </div>
    )
}
export default Resume