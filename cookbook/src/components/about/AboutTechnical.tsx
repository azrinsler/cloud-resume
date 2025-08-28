import * as React from 'react';

import '../../css/about-technical.css'

import {useEffect, useState} from 'react';

interface AboutTechnicalProps extends React.PropsWithChildren {
    images: React.JSX.Element[],
    captions: React.JSX.Element[]
}

const AboutTechnical: React.FC<AboutTechnicalProps> = (props: AboutTechnicalProps) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const [activeSlide, setActiveSlide] = useState(0)

    // highlights selected image with a border on desktop only
    useEffect(() => {
        const activeImg = document.getElementById(props.images[activeSlide].props.id)
        console.log(activeImg);
        if (!isMobile) {
            activeImg?.scrollIntoView({behavior:'smooth',inline:'center'})
            activeImg!.style.border = '5px solid light-dark(blue,white)'
        }
        props.images.forEach((image) => {
            const thisImg = document.getElementById(image.props.id)
            if (thisImg != activeImg) {
                thisImg!.style.border = 'initial'
            }
        })
    }
    , [activeSlide, isMobile, props.images]);


    const handleNextImage = () => {
        setActiveSlide(activeSlide < props.images.length - 1 ? activeSlide + 1 : 0)
    }

    const handlePrevImage = () => {
        setActiveSlide(activeSlide > 0 ? activeSlide - 1 : props.images.length - 1)
    }

    return (
        <>
            <div id='about-technical-images' className='flex-row hide-scrollbar'>
                <h1 onClick={handlePrevImage} className='about-technical-arrow-button' style={{left:'0'}}>&lt;</h1>
                { props.images.map( (image) =>  <div key={image.props.id} style={{display:'flex',placeContent:'center'}}>{image}</div> ) }
                <h1 onClick={handleNextImage} className='about-technical-arrow-button' style={{right:'0'}}>&gt;</h1>
            </div>
            <div id='about-technical-radio' className='flex-row'>
                { props.images.map( (_image, index) => (
                    <input
                        key={'about-technical-radio-'+index }
                        type='radio'
                        name='selected-about-technical'
                        id={'about-technical-radio-'+index }
                        checked={ activeSlide == index }
                        onClick={ () => { setActiveSlide(index) } }
                        style={{width:100/props.images.length+'%'}}
                        onChange={()=>{}}
                    ></input>
                ) ) }
            </div>
            <div id='about-technical-content' className='flex-column'>
                { props.captions.map( (caption, index) => (
                    <div hidden={activeSlide != index}>{caption}</div>
                ) ) }
            </div>
        </>
    )
}
export default AboutTechnical