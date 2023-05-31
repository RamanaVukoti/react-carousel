import React, {
    Children,
    useRef,
    useCallback,
    useEffect,
    useMemo,
    useState
  } from "react"
  import ReactDOM from "react-dom"
  import {arrayOf, bool, func, node, number, shape, string} from "prop-types"
  import {clamp, range} from "ramda"
  import {Motion, spring} from "react-motion"
  import styled from "styled-components";
  import styles from "./slider.module.css"

  

interface ComponentProps {
    maxWidth?: string;
    overflow?: string;
    position?:string;
    ref?:any;
    width?:string;
    display?:string;
    flex?:string;
  }
  

  const Box =styled.div<ComponentProps>`
    max-Width:${props=>props.maxWidth};
    position:${props=>props.position};
    overflow:${props=>props.overflow};
    width:${props=>props.width};
    display:${props=>props.display};
    flex:${props=>props.flex};

  `
  const Flex =styled.div<ComponentProps>`
    max-Width:${props=>props.maxWidth};
    position:${props=>props.position};
    overflow:${props=>props.overflow};
    width:${props=>props.width};
    flex:${props=>props.flex};
    display:flex;

  `
  
  const callIfFunc= (func:any, ...args:any) =>
  typeof func === "function" ? func.apply(this, args) : null

  const useMediaQuery = (query:any) => {
    const [matches, setMatches] = useState(false)
  
    useEffect(() => {
      const media = window.matchMedia(query)
      if(media.matches !== matches) {
        setMatches(media.matches)
      }
      const listener = () => setMatches(media.matches)
      window.addEventListener("resize", listener)
      return () => window.removeEventListener("resize", listener)
    }, [matches, query])
  
    return matches
  }
  
  const deriveControlColor =(paginationColor:any)=>{
      if(paginationColor === 'white'){
          return "rgb(255, 255, 255)"
      }
      return "rgb(0, 0, 0)"
  }
  
  const calculateMaxPages = (children:any, slidesToChange:any, slidesToShow = 1) =>
      slidesToChange
          ? Math.ceil((Children.count(children) - slidesToShow) / slidesToChange)
          : Math.ceil((Children.count(children) - slidesToShow) / slidesToShow)
    
  const Slider = (
    {
                      allowOverflow: defaultAllowOverflow,
                      animationSettings = {
                          dampening: 0,
                          stiffness: 180
                      },
                      children,
                      className,
                      customControls: defaultCustomControls,
                      customDots: defaultCustomDots,
                      customDotsContainer: defaultCustonDotsContainer,
                      dotsOnClick,
                      expand,
                      hideArrows: defaultHideArrows,
                      hideControls: defaultHideControls,
                      hideDots: defaultHideDots,
                      initialPage: defaultInitialPage,
                      nextArrow,
                      nextOnClick,
                      onDecrementPage,
                      onIncrementPage,
                      onPageChange,
                      onDrag,
                      onSwipe,
                      overflowVisible: defaultOverflowVisible,
                      position = "relative",
                      prevArrow,
                      prevOnClick,
                      responsive,
                      siteViewportWidth,
                      slidesToChange: defaultSlidesToChange,
                      slidesToShow: defaultSlidesToShow,
                      teardown: defaultTeardown,
                      touch: defaultTouch,
                      wrapperProps,
                      transitionDelay,
                      isRotator,
                      teaserImages,
                      rotatorMobilePaginationColors,
                      isFlexContainer,
                      rotatorAutoPlay,
                      controlsRef
                  }:any) => {
      const PROGRESS_CIRCLE_RADIUS = 150
      const isSmallDevice = useMediaQuery("(max-width: 949px)")
      const sliderRef = useRef()
      const [currentPage, setCurrenPage] = useState(0)
      const [initialTransTime, setInitialTransTime] = useState(0)
      const [timerPaused, setTimerPaused] = useState(false)
      const [timerPausedDiff, setTimerPausedDiff] = useState(0)
      const [progressStoke, setProgressStoke] = useState(2 * 3.14 * PROGRESS_CIRCLE_RADIUS)
  
      const [dragDistance, setDragDistance] = useState(0)
      const [dragStart, setDragStart] = useState(0)
      const [dragging, setDraggging] = useState(false)
      const [hideControlsState, setHideControlsState] = useState(false)
      const [teardown, setTeardown] = useState(false)
      const [viewportWidth, setViewportWidth] = useState(1)
  
      const defaults = useMemo(
          () => ({
              allowOverflow: defaultAllowOverflow,
              customControls: defaultCustomControls,
              customDots: defaultCustomDots,
              customDotsContainer: defaultCustonDotsContainer,
              hideArrows: defaultHideArrows,
              hideControls: defaultHideControls,
              hideDots: defaultHideDots,
              initialPage: defaultInitialPage,
              overflowVisible: defaultOverflowVisible,
              slidesToChange: defaultSlidesToChange,
              slidesToShow: defaultSlidesToShow,
              teardown: defaultTeardown,
              touch: defaultTouch
          }),
          [
              defaultAllowOverflow,
              defaultCustomControls,
              defaultCustomDots,
              defaultCustonDotsContainer,
              defaultHideArrows,
              defaultHideControls,
              defaultHideDots,
              defaultInitialPage,
              defaultOverflowVisible,
              defaultSlidesToChange,
              defaultSlidesToShow,
              defaultTeardown,
              defaultTouch
          ]
      )
  
      const {
          allowOverflow,
          customControls,
          customDots,
          customDotsContainer,
          hideArrows,
          hideControls,
          hideDots,
          initialPage,
          maxPages,
          overflowVisible,
          slidesToShow,
          slidesToChange,
          slideWidth,
          touch
      } = useMemo(() => {
          return (
              responsive
                  // get breakpoints that are below viewportWidth (mobile first)
                  .filter((obj:any) => obj.breakpoint <= viewportWidth)
                  // update max number of pages per object
                  .map(
                      ({
                           slidesToShow: mapSlidesToShow = defaultSlidesToShow,
                           slidesToChange: mapSlidesToChange = defaultSlidesToChange,
                           teardown: mapTeardown = defaultTeardown,
                           ...rest
                       }) => {
                          return {
                              ...rest,
                              maxPages: calculateMaxPages(
                                  children,
                                  mapSlidesToChange,
                                  mapSlidesToShow
                              ),
                              slideWidth: mapSlidesToShow ? 1 / mapSlidesToShow : 1,
                              slidesToChange: mapSlidesToChange,
                              slidesToShow: mapSlidesToShow,
                              teardown: mapTeardown
                          }
                      }
                  )
                  .reduce(
                      (accum:any, obj:any) => {
                          if (obj.breakpoint >= accum.breakpoint) {
                              setTeardown(obj.teardown)
                              return {...defaults, ...obj}
                          }
                          return accum
                      },
                      {
                          breakpoint: 0,
                          ...defaults
                      }
                  )
          )
      }, [
          children,
          defaultSlidesToChange,
          defaultSlidesToShow,
          defaultTeardown,
          defaults,
          responsive,
          viewportWidth
      ])
  

      console.log({allowOverflow,
          customControls,
          customDots,
          customDotsContainer,
          hideArrows,
          hideControls,
          hideDots,
          initialPage,
          maxPages,
          overflowVisible,
          slidesToShow,
          slidesToChange,
          slideWidth,
          touch})
      // handle all updating of currentPage
      const updateCurrentPage = useCallback(
          (page:any) => {
              callIfFunc(onPageChange, page)
              setCurrenPage(page)
              setDraggging(false)
          },
          [onPageChange]
      )
  
      const incrementPage = useCallback(() => {
          // console.log({currentPage})
          callIfFunc(onIncrementPage)
          updateCurrentPage(currentPage + 1)
      }, [currentPage, onIncrementPage, updateCurrentPage])
  
      const decrementPage = useCallback(() => {
          callIfFunc(onDecrementPage)
          updateCurrentPage(currentPage - 1)
      }, [currentPage, onDecrementPage, updateCurrentPage])
  
      // handle updating of viewport width
      const updateViewportState = useCallback(() => {
          setViewportWidth(window.innerWidth)
      }, [])
  
      const handleMouseMove = useCallback(
          ({clientX}:any) => {
              const drag =
                  sliderRef.current && sliderRef.current['clientWidth']
                      ? Math.round(
                          ((dragStart - clientX) / sliderRef.current['clientWidth']) * 100
                      )
                      : Math.round(((dragStart - clientX) / viewportWidth) * 100)
              const threshold = slideWidth * slidesToShow * 30
  
              if (dragging) {
                  if (Math.abs(drag) > threshold) {
                      callIfFunc(onSwipe)
                      if (drag > 0) {
                          incrementPage()
                      } else if (drag < 0) {
                          decrementPage()
                      }
                  } else if (Math.abs(drag) < threshold) {
                      callIfFunc(onDrag)
                      setDragDistance(drag)
                  }
              }
          },
          [
              decrementPage,
              dragStart,
              dragging,
              incrementPage,
              onDrag,
              onSwipe,
              slideWidth,
              slidesToShow,
              viewportWidth
          ]
      )
  
      const handleMouseDown = useCallback(({clientX}:any) => {
          setDragStart(clientX)
          setDraggging(true)
      }, [])
  
      // handle drag events
      const handleTouchMove = useCallback(
          (e:any) => {
              handleMouseMove(e.touches[0])
          },
          [handleMouseMove]
      )
  
      const handleTouchStart = useCallback(
          (e:any) => {
              handleMouseDown(e.touches[0])
          },
          [handleMouseDown]
      )
  
      const resetDragParams = useCallback(() => {
          setDragDistance(0)
          setDragStart(0)
          setDraggging(false)
      }, [])
  
      const isTouch = useMemo(() => !teardown && touch, [teardown, touch])
  
      useEffect(() => {
          setCurrenPage(initialPage)
      }, [initialPage])
  
  
  // rotator code - START
      const triggerRotation = () => {
          if (maxPages === currentPage) {
              setCurrenPage(0)
          } else {
              incrementPage()
          }
      }
  
      const toggleTimer = () => {
          setTimerPaused(!timerPaused)
          if (!timerPaused) {
              const now = new Date().getTime()
              const diff = now - initialTransTime
              setTimerPausedDiff(diff)
          }
      }
  
  
      const updateTimer = () => {
          if (timerPausedDiff >= 0 && !timerPaused) {
              let diff = transitionDelay - timerPausedDiff
              return setInterval(() => {
                  if (diff > 0) {
                      diff = diff - 20
                      const circ = 2 * PROGRESS_CIRCLE_RADIUS * 3.14 //2PIR
                      const filled = circ * (diff / transitionDelay)
                      setProgressStoke(filled)
                  }
              }, 20)
  
          }
      }
  
      useEffect(() => {
          if (isRotator && rotatorAutoPlay) {
              const progressTimer = updateTimer()
              if (progressTimer) {
                  return (() => {
                      window.clearInterval(progressTimer)
                  })
              }
          }
      }, [currentPage, timerPaused])
  
  
      useEffect(() => {
          if (isRotator && rotatorAutoPlay) {
              const transitionTimer = setInterval(() => {
                  const now = new Date().getTime()
                  const diff = now - initialTransTime
                  if (!timerPaused) {
                      if (diff >= (transitionDelay)) {
                          setTimerPausedDiff(0)
                          triggerRotation()
                      }
                  }
              }, 1)
              return (() => {
                  window.clearInterval(transitionTimer)
              })
          }
      }, [initialTransTime])
  
  
      useEffect(() => {
          if (isRotator && rotatorAutoPlay) {
              setInitialTransTime(prev => {
                  if (!timerPaused) {
                      return new Date().getTime() - timerPausedDiff
                  }
                  return new Date().getTime()
              })
          }
      }, [rotatorAutoPlay, isRotator, currentPage, timerPausedDiff, timerPaused])
  // rotator code - END
      useEffect(() => {
          updateViewportState()
          if (!siteViewportWidth) {
              window.addEventListener("resize", updateViewportState)
          }
          window.addEventListener("mousemove", handleMouseMove)
          window.addEventListener("touchmove", handleTouchMove)
          return () => {
              if (!siteViewportWidth) {
                  window.removeEventListener("resize", updateViewportState)
              }
              window.removeEventListener("mousemove", handleMouseMove)
              window.removeEventListener("touchmove", handleTouchMove)
          }
      }, [updateViewportState, handleMouseMove, handleTouchMove, siteViewportWidth])
  
      const overflow = useMemo(() => {
          if (overflowVisible) {
              return "visible"
          }
          if (teardown) {
              return "scroll"
          }
          return "hidden"
      }, [overflowVisible, teardown])
  
  
      // handle all updating of translateX
      const transValue = useMemo(() => {
          // translation calculations
          const numberOfSlides = Children.count(children)
          const transValueWithoutOverflow =
              (numberOfSlides - slidesToShow) * slideWidth * 100
          const transValueWithOverflow =
              (maxPages + slidesToChange / slidesToShow) * 100
          const pageTranslateWidth = slidesToChange * slideWidth * 100
          const maxTrans = Math.max(
              0,
              allowOverflow ? transValueWithOverflow : transValueWithoutOverflow
          )
          const maxTransWithDrag = maxTrans + 5
          const minTrans = -5
          const newTransValue = clamp(
              minTrans,
              maxTrans,
              currentPage * pageTranslateWidth
          )
  
          setHideControlsState(numberOfSlides <= slidesToShow)
  
          return clamp(minTrans, maxTransWithDrag, newTransValue + dragDistance)
      }, [
          allowOverflow,
          children,
          currentPage,
          dragDistance,
          maxPages,
          slideWidth,
          slidesToChange,
          slidesToShow
      ])
  
      return (
        <Box
          className={className}
          maxWidth="100%"
          overflow={overflow}
          position={position}
          ref={sliderRef.current}
          width={"100%"}
        >
          <Motion
            defaultStyle={{ drag: 0, transform: 0 }}
            style={{
              transform: spring(-transValue, animationSettings),
            }}
          >
            {(style) => (
              <Flex
              flex="0 0 auto"
                onMouseDown={isTouch ? handleMouseDown : null}
                onMouseLeave={resetDragParams}
                onMouseUp={isTouch ? resetDragParams : null}
                onTouchEnd={isTouch ? resetDragParams : null}
                onTouchStart={isTouch ? handleTouchStart : null}
                style={{ transform: `translate3d(${style.transform}%, 0, 0)` }}
                {...wrapperProps}
              >
                {Children.map(children, (child) => (
                  <Box
                    key={child.key}
                    display="inline-block"
                    flex="0 0 auto"
                    
                    width={`${(100*slideWidth)}%` || "auto"}
                  >
                    {child}
                  </Box>
                ))}
              </Flex>
            )}
          </Motion>
          {teardown || hideControlsState || hideControls ? null : (
            <div
              
            >
            
              {hideArrows || controlsRef ? null : (
                <>
                  {" "}
                  {!isRotator && (
                    <div
                      
                      onClick={() => {
                        decrementPage();
                        callIfFunc(prevOnClick, currentPage - 1);
                      }}
                    >Inc</div>
                  )}
                </>
              )}
              {hideDots ? null : (
                <>
                  {" "}
                  {!isRotator && (
                    <div
                     
                      onClick={(pageNumber) => {
                        
                        updateCurrentPage(pageNumber);
                        callIfFunc(dotsOnClick, pageNumber);
                      }}
                    />
                  )}
                </>
              )}
              
              {hideArrows || controlsRef ? null : (
                <>
                  {" "}
                  {!isRotator && (
                    <div
                     
                      onClick={() => {
                        incrementPage();
                        callIfFunc(nextOnClick, currentPage + 1);
                      }}
                    >Dec</div>
                  )}
                </>
              )}
            </div>
          )}
        </Box>
      );
  }
  Slider.propTypes = {
      allowOverflow: bool,
      animationSettings: shape({
          dampening: number,
          stiffness: number
      }),
      children: node || func,
      className: string,
      /** Custom controls container, needs to render children */
      customControls: func,
      /** Custom dots container */
      customDots: func,
      /** Custom dots, needs to bind onClick prop */
      customDotsContainer: func,
      /** Custom onclick function for dots */
      dotsOnClick: func,
      expand: bool,
      /** Hide arrows setting */
      hideArrows: bool,
      /** Hide controls setting */
      hideControls: bool,
      /** Hide dots setting */
      hideDots: bool,
      /** Initial starting page */
      initialPage: number,
      /** Custom next button, needs to bind onClick prop */
      nextArrow: func,
      /** Custom onclick function for next arrow */
      nextOnClick: func,
      /** Function that triggers on page decrement */
      onDecrementPage: func,
      /** Function that triggers on drag */
      onDrag: func,
      /** Function that triggers on page increment */
      onIncrementPage: func,
      /** Function that triggers on page change */
      onPageChange: func,
      /** Function that triggers on swipe */
      onSwipe: func,
      /** Show all slides */
      overflowVisible: bool,
      /** postion prop of main container */
      position: string,
      /** Custom prep button , needs to bind onClick prop */
      prevArrow: func,
      /** Custom onclick function for prev arrow */
      prevOnClick: func,
      /** Array of objects overriding props by breakpoint key */
      responsive: arrayOf(
          shape({
              breakpoint: number,
              
              slidesToShow: number,
                  slidesToChange: number
              
          })
      ),
      /** number given with the viewport width */
      siteViewportWidth: number,
      /** Number of slides to change per scroll */
      slidesToChange: number,
      /** Number of slides shown per page */
      slidesToShow: number,
      /** Teardown the slider and just use overflow */
      teardown: bool,
      /** Enable touch setting */
      touch: bool,
      wrapperProps: Object
  }
  Slider.defaultProps = {
      allowOverflow: false,
      expand: false,
      hideArrows: false,
      hideControls: false,
      hideDots: false,
      initialPage: 0,
      overflowVisible: false,
      responsive: [{breakpoint: 0}],
      slidesToChange: 1,
      slidesToShow: 1,
      teardown: false,
      touch: true
  }
  
  export default Slider