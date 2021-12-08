function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const catImgs = [
    'green_cat1',
    'blue_cat1',
    'purple_cat1',
    'yellow_cat1'
]

const NFT = ({
    index,
    model,
    onClick
}) => {
    // console.log("Renderer nft, index: " + index)
    let {viewData, staticData, userData, active} = model;

    return <>
        <style jsx>
            {`
                .bg-top-buy {
                    border: 2px solid black;
                    //border-image: url('/bg-top-buy.png') 30 round;
                    background-color: rgb(222, 213, 193);
                }
                .btn-buy {
                    background: url('/bg-btn.png') center no-repeat;
                    background-size: contain;
                }
                .btn-buy-end {
                    background: url('/bg-btn-gray.png') center no-repeat;
                    background-size: contain;
                }
                .btn-confirm {
                    background: url('/bg-top-buy.png') center no-repeat;
                    background-size: contain;
                }
                .item.active {
                  box-shadow: 0 1px 5px 4px rgba(220, 38, 38,.6);
                }
                .item.active.item:hover {
                  box-shadow: 0 1px 5px 4px rgba(220, 38, 38,.6);
                }
                .item:hover {
                    box-shadow: 0 1px 5px 4px rgba(0,0,0,.2);
                    //box-shadow: 0 1px 5px 4px rgba(220, 38, 38,.6);
                }
            `}
        </style>

        <div className={classNames('relative bg-top-buy cursor-pointer item', active && 'active', (staticData && staticData.leftCount === 0) &&
            'hover:shadow-none cursor-default')} onClick={() => {
            if (onClick) {
                onClick(index)
                // console.log(index)
            }
        }}>

            { staticData && staticData.leftCount === 0 && <img src="/sold_out.png" className="absolute -right-10 -top-10" width="80" layout="cover" unoptimized="true" /> }

            <div className="flex space-x-2">
                <div className="w-2/5 flex-shrink-1 m-1">
                    <img src={`/box/${catImgs[index]}.png`} className="w-full h-auto"/>
                </div>

                <div className="flex-1 flex-shrink-0 flex flex-col text-lg pt-1">
                    <div className="font-bold text-sm xs:text-lg">
                        <div className="flex justify-between py-2.5">
                            <div
                                className="w-16 md:w-20"
                                style={{ color: 'rgb(138,124,106)' }}
                            >
                                Type
                            </div>
                            <div
                                className="flex-1 line-clamp-none md:line-clamp-3"
                                style={{ color: viewData.nftColor }}
                            >
                                {viewData.name}
                            </div>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <div
                                className="w-16 md:w-20"
                                style={{ color: 'rgb(138,124,106)' }}
                            >
                                Price
                            </div>
                            <div className="flex-1" style={{ color: 'rgb(91,50,25)' }}>
                                { staticData == null ? 'loading...' : staticData.priceStr }
                            </div>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <div
                                className="w-16 md:w-20"
                                style={{ color: 'rgb(138,124,106)' }}
                            >
                                Number
                            </div>
                            <div className="flex-1" style={{ color: 'rgb(91,50,25)' }}>
                                { staticData == null ? 'loading...' : (
                                    staticData.leftCount === 0 ? 'Sold out' : `${staticData.leftCount} / ${staticData.total}`)}
                            </div>
                        </div>

                        <div className="mt-1 text-sm font-normal" style={{color: 'rgb(128,128,128)'}}>
                            {viewData.nftTips}
                        </div>
                    </div>
                </div>
            </div>

            {/*<div className="sm:hidden mt-1 text-xs xs:text-lg font-normal" style={{color: 'rgb(166,156,153)'}}>*/}
            {/*    contains 5 random cats! Legency cat won't appear.*/}
            {/*</div>*/}

            {/*<div className="hidden lg:block absolute bottom-0 bg-white h-px left-2 right-2"></div>*/}
        </div>

    </>
}

export default NFT
