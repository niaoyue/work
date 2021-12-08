import React from "react";

const Loader = () => <>
    <div className="loader" />
    <style jsx>
        {`
          @keyframes load {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        .loader {
            border: 4px solid rgba(255, 255, 255, 0.5);
            border-left: 4px solid;
            animation: load 1s infinite linear;
            border-radius: 50%;
            width: 25px;
            height: 25px;
        }
    `}
    </style>
</>

export default Loader
