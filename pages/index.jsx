import { bgImg, timeline } from '../assets/index.module.css'
import {useEffect, useState} from "react";
import {calculateTimeLeft} from "../utils";

function Index() {
  const [showDownload, setShowDownload] = useState(false)
  const [startTime, setStartTime] = useState(new Date('2021-12-07T15:00:00+00:00').getTime())
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime))

  // 倒计时
  useEffect(() => {
    let timer = setTimeout(() => {
      // console.log("startTime: " + startTime)
      const left = calculateTimeLeft(startTime)
      setTimeLeft(left)
    }, 1000)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [timeLeft, startTime])

  return (
    <div style={{ backgroundColor: 'rgb(205,205,205)' }}>
      <style jsx>{`
        .buy-btn {
          background: url(/bg-btn.png) 0 0 no-repeat;
          background-size: 100%;
        }
        .buy-btn-gray {
          background: url(/bg-btn-gray.png) 0 0 no-repeat;
          background-size: 100% 100%;
        }
        .bg-download {
          background: url(/bg-cat.png) right bottom no-repeat;
        }
        .bg-windows {
          background: url(/windows.png) 0 0 no-repeat;
          background-size: contain;
        }
        .bg-android {
          background: url(/android-1.png) 0 0 no-repeat;
          background-size: contain;
        }
      `}</style>
      <div className="w-full md:max-w-280 mx-auto shadow-2xl">
        <div
          style={{
            maxHeight: '630px',
            background: 'rgb(223,210, 184)',
          }}
          className="relative"
        >
          <iframe
            src="https://www.youtube.com/embed/0-6RP7cXQZQ"
            title="YouTube video player"
            className={`relative w-full h-250 md:h-300 lg:h-600`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className={`${bgImg} pt-10`}>

          <div className="mb-6 px-5 text-center flex md:flex-row flex-col md:space-x-2 space-y-2 justify-center md:items-baseline items-center">
            <div className="font-medium text-lg md:text-xl" style={{ color: 'rgb(138, 124, 106)' }}>Cat NFT Smart Contract:</div>
            <a href="https://bscscan.com/address/0x26839d37d2fF8B24d40758258F20c990603D56e8" className="md:text-lg text-md text-FFA72F underline break-all">0x26839d37d2fF8B24d40758258F20c990603D56e8</a>
          </div>
          <div className="flex justify-center">
            <a
              href="/buy"
              className="flex justify-center items-center px-3 buy-btn md:-bottom-28 lg:-bottom-52 mb-0 lg:mb-5 cursor-pointer text-center w-192 h-75 lg:w-384 lg:h-150 transform scale-75 md:scale-90"
            >

              <img className="" src="/btn-text.png" layout="cover" />
            </a>

            <div className="flex flex-col justify-center items-center">
              <button
                className={`flex justify-center items-center px-3 ${timeLeft ? 'buy-btn-gray cursor-default' : 'buy-btn' +
                  ' cursor-pointer'} md:-bottom-28 lg:-bottom-52' +
                  ' mb-0 lg:mb-5 text-center w-192 h-75 lg:w-384 lg:h-150 transform scale-75 md:scale-90`}
                onClick={() => {
                  if (timeLeft) {
                    return false
                  }
                  window.scrollTo(0, 0)
                  setShowDownload(true)
                }}
              >
                <img className="" src="/playnow-text.png" layout="cover" />
              </button>
              {timeLeft &&
              <div className="rounded-full py-2 lg:py-4 px-3 lg:px-20" style={{backgroundColor: '#613a13'}}>
                <div className="text-sm lg:text-26 text-white text-center">Available In</div>
                {/*new Date('2021-12-07T15:00:00')*/}
                <div className="flex flex-col items-center justify-center mx-3 mt-0 lg:mt-2">
                  {/*购买未开始，倒计时*/}
                  {timeLeft != null && (
                    <div className="flex items-center space-x-1 text-white">
                      {String(timeLeft.hours)
                        .padStart(2, '0')
                        .split('')
                        .map((item, index) => (
                          <div key={index}
                               className="rounded-lg flex items-center justify-center font-bold text-xs lg:text-xl">
                            {item}
                          </div>
                        ))}

                      <div className="font-bold px-1 text-xs lg:text-xl">:</div>
                      {String(timeLeft.minutes)
                        .padStart(2, '0')
                        .split('')
                        .map((item, index) => (
                          <div key={index}
                               className="rounded-lg flex items-center justify-center font-bold text-xs lg:text-xl">
                            {item}
                          </div>
                        ))}

                      <div className="font-bold px-1 text-xs lg:text-xl">:</div>
                      {String(timeLeft.seconds)
                        .padStart(2, '0')
                        .split('')
                        .map((item, index) => (
                          <div key={index}
                               className="rounded-lg flex items-center justify-center font-bold text-xs lg:text-xl">
                            {item}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              }
            </div>
          </div>

          <div className="hidden md:flex space-x-5 py-20 px-16 mt-10">
            <div>
              <img src={'/pc1.png?t=1'} alt="" />
            </div>
            <div>
              <img src={'/pc2.png?t=1'} alt="" />
            </div>
            <div>
              <img src={'/pc3.png?t=1'} alt="" />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center justify-center space-y-10 sm:w-3/5 w-4/5 py-20 px-8 mx-auto">
            <div>
              <img src={'/pic1-1.png?t=1'} alt="" />
            </div>
            <div>
              <img src={'/pic2-1.png?t=1'} alt="" />
            </div>
            <div>
              <img src={'/pic3-1.png?t=1'} alt="" />
            </div>
          </div>

          <div className="flex justify-center pb-16">
            <img src="/line.png" />
          </div>

          <div className="w-full flex flex-col items-center justify-center pb-32">
            <div
              className="text-2xl md:text-3xl font-medium mb-16"
              style={{ color: 'rgb(67,31,7)' }}
            >
              RoadMap
            </div>
            <div
              className={`relative md:pl-0 pb-10 ${bgImg} h-1150 md:h-1050 lg:h-900`}
            >
              <ul className={timeline}>
                {/* 1 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-right.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats Game Trailer Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Sep.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 2 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-left.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    First round NFT community subscription
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Oct.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 3 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-right.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats Beta Version Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Oct.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 4 */}
                <li className="flex items-center text-sm md:text-lg">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-left.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Cate NFT First Round Auctions Launch
                  </div>
                  {/*<div*/}
                  {/*  className="font-medium flex-shrink-0 w-84"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Oct.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 5 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-right.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats Game V1.0 Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Oct.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 6 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-left.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Cate NFT Second Round Auctions Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Oct.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 7 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-right.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats NFT Dex Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Nov.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 8 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5  md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-left.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats NFT Staked Mining Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Dec.&nbsp;2021*/}
                  {/*</div>*/}
                </li>
                {/* 9 */}
                <li className="flex items-center">
                  <div
                    className="text-black p-5 md:w-250 lg:w-358 text-sm md:text-lg"
                    style={{
                      background: 'url(/bg-text-right.png) center no-repeat',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Rise of Cats Game V2.0 Launch
                  </div>
                  {/*<div*/}
                  {/*  className="flex-shrink-0 w-84 font-medium text-sm md:text-lg"*/}
                  {/*  style={{ color: 'rgb(68,49,18)' }}*/}
                  {/*>*/}
                  {/*  Jan.&nbsp;2022*/}
                  {/*</div>*/}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/*download modal*/}
      {showDownload && (
          <div className="fixed inset-0 bg-black opacity-50"></div>
      )}
      {showDownload && (
          <div
              className="w-10/12 h-250 sm:w-510 sm:h-360 absolute left-1/2 top-1/2 pt-5 pb-5 transform -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-black"
              style={{ backgroundColor: 'rgb(248,242,228)' }}
          >
            <div
                className="absolute top-2 right-2 w-8 h-8 cursor-pointer"
                onClick={() => {
                  setShowDownload(false)
                }}
            >
              <img src="/btn-close.png" layout="fill" />
            </div>

            <img className="absolute right-0 bottom-0 w-108 sm:w-auto" src="/bg-cat.png" />

            <div
                className="pt-2 pb-10 text-xl md:text-2xl text-gray-800 font-bold text-center"
                style={{ color: 'rgb(91,50,25)' }}
            >
              Download game now!
            </div>

            <div className="flex flex-col sm:space-y-4 ml-2 sm:ml-10 mt-4 sm:mt-22 md:px-0">
              <a href='https://drive.google.com/file/d/1NH2T29NFI0pPpO2-vs8CCd4kd1X3FKxF/view'
                 target="_blank"
                 className="flex items-center justify-between px-2 bg-windows w-198 h-56 transform scale-75 sm:scale-100">
                <img src="/windows-logo.png" />
                <img src="/windows-text.png" className="-mt-1" />
              </a>

              <a href="https://drive.google.com/file/d/1IyHIRTEMpJnTbz-cqqU4LM6z8Z2BmSBZ/view"
                 target="_blank"
                 className="flex items-center justify-between px-2 bg-android w-198 h-56 transform scale-75 sm:scale-100">
                <img src="/android-logo.png" />
                <img src="/android-text.png" className="-mt-1" />
              </a>
            </div>
          </div>
      )}
      {/*download modal end*/}
    </div>
  )
}

export default Index
