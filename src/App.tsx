import React, { useRef } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Slider2 } from './slider/slider2';
// import Slider from './slider/slider';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

function App() {

  const slider = useRef<any>(null)

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    afterChange: (i: any) => {
      console.log({ i })
    }
  };

  const gotoNext = () => {
    slider.current.slickNext()
  }
  const gotoPrev = () => {
    slider.current.slickPrev()
  }



  return (
    <div className="App content">
      <div>
        

        <button onClick={() => gotoPrev()}>prev</button>
        <button onClick={() => gotoNext()}>next</button>
        
        
        
        
        <Slider ref={slider}  {...settings}>
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
        </Slider>



      </div>
    </div>
  );
}

export default App;
