import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Slider2 } from './slider/slider2';
// import Slider from './slider/slider';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Carousel } from './carousel';

function App() {


  const settings = {
    className: "center",
    centerMode: true,
    infinite: false,
    centerPadding: "60px",
    slidesToShow: 3,
    slidesToScroll:4,
    speed: 500,
    afterChange: (i: any) => {
      console.log({ i })
    }
  };

  const settings2 = {

    infinite: false,
    centerPadding: "60px",
    slidesToShow: 3,
    centerMode:true,
    slidesToScroll:2,
    speed: 500,
    afterChange: (i: any) => {
      console.log({ i })
    }
  };



  return (
    <div className="App content">




      <div>
        <div>

          
        </div>
        <div>
          <Carousel settings={settings2} >
            <div>
              <h3>1</h3>
            </div>
            <div>
              <h3>2</h3>
            </div>
            <div>
              <h3>3</h3>
            </div>
            <div>
              <h3>4</h3>
            </div>
            <div>
              <h3>5</h3>
            </div>
            <div>
              <h3>6</h3>
            </div>
            <div>
              <h3>7</h3>
            </div>
            <div>
              <h3>8</h3>
            </div>
          </Carousel>
        </div>
      </div>



    </div>
  );
}

export default App;
