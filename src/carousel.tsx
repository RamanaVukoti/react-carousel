import React, { Children, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Slider2 } from './slider/slider2';
// import Slider from './slider/slider';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'


export const Carousel = ({ children, settings }: any) => {


    const [nextBtn, setNextBtn] = useState(true)
    const [prevBtn, setPrevBtn] = useState(false)

    const getSlidesToScroll = () => settings.slidesToScroll

    const config = {
        ...settings,
        afterChange: (i: number) => {
            const currentSides = i
            const totalChildren = Children.count(children)
            const diff = currentSides + settings.slidesToShow
            if (diff >= totalChildren) {
                setNextBtn(false)
            } else {
                setNextBtn(true)
            }


            setPrevBtn(!(currentSides === 0))





        }
    }

    const count = Children.count(children)

    console.log({ count })
    const slider = useRef<any>(null)

    const gotoNext = () => {

        slider.current.slickNext()
    }
    const gotoPrev = () => {
        slider.current.slickPrev()
    }


    return <div>
        <div>
            <button disabled={!prevBtn} onClick={gotoPrev}>prev</button>
            <button disabled={!nextBtn} onClick={gotoNext}>next</button>

        </div>
        <div>

            <Slider ref={slider}  {...config} >

                {children}
            </Slider>
        </div>

    </div>


}