import { useEffect, useState, useRef } from 'react'
import { calculateTimeLeft } from '../utils'
import axios from 'axios'
import NFT from '../components/NFT'
import { ethers, BigNumber } from 'ethers'
import { getBlockchain, getSignBlockChain } from '../utils/ethereum.js'
import { useWeb3Modal } from '../utils/useWeb3Modal'
import Loader from '../components/Loader'
import Alert from '../components/Alert'
import { BsArrowDownSquareFill, BsArrowRightSquareFill } from 'react-icons/bs'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAINID
const EACH_LIMIT_COUNT = 2

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const cats = [
  {
    name: 'Common Cats',
    number: 4480,
    rate: '32%',
    color: '',
  },
  {
    name: 'Uncommon Cats',
    number: 3920,
    rate: '28%',
    color: '#83D567',
  },
  {
    name: 'Rare Cats',
    number: 2800,
    rate: '20%',
    color: '#4FB0F2',
  },
  {
    name: 'Unique Cats',
    number: 1680,
    rate: '13%',
    color: 'pink',
  },
  {
    name: 'Epic Cats',
    number: 840,
    rate: '5%',
    color: '#B474CB',
  },
  {
    name: 'Legendary Cats',
    number: 280,
    rate: '2%',
    color: '#FFA72F',
  },
]

const BlindBoxes = [
  {
    name: 'Common box',
    common: '40.000%',
    uncommon: '40.000%',
    rare: '13.607%',
    unique: '5.250%',
    epic: '1.000%',
    legendary: '0.143%',
    color: '',
    nftColor: '#83D567',
    nftTips: (<>
                <p>Contains 5 random cats.</p>
                <p>Including 1 uncommon cat at least.</p>
              </>),
  },
  {
    name: 'Rare box',
    common: '29.500%',
    uncommon: '21.500%',
    rare: '28.000%',
    unique: '15.000%',
    epic: '4.250%',
    legendary: '1.750%',
    color: '',
    nftColor: 'rgb(93,179,238)',
    nftTips: (<>
                <p>Contains 5 random cats!</p>
                <p>Including 1 <span style={{color: 'rgb(93,179,238)'}}>rare</span> cat at least.</p>
                <p>Contains 1 <span style={{color: 'rgb(93,179,238)'}}>rare</span> avatar frame.</p>
              </>),
  },
  {
    name: 'Epic box',
    common: '24.000%',
    uncommon: '16.000%',
    rare: '16.000%',
    unique: '20.000%',
    epic: '20.000%',
    legendary: '4.000%',
    color: '',
    nftColor: 'rgb(195,150,199)',
    nftTips: (<>
                <p>Contains 5 random cats!</p>
                <p>Including 1 <span style={{color: 'rgb(195,150,199)'}}>epic</span> cat at least.</p>
                <p>Contains 1 <span style={{color: 'rgb(195,150,199)'}}>epic</span> avatar frame.</p>
              </>),
  },
  {
    name: 'Legendary box',
    common: '0.000%',
    uncommon: '24.000%',
    rare: '22.286%',
    unique: '16.000%',
    epic: '16.000%',
    legendary: '21.714%',
    color: '',
    nftColor: 'rgb(250,176,90)',
    nftTips: (<>
                <p>Contains 5 random cats!</p>
                <p>Including 1 <span style={{color: 'rgb(250,176,90)'}}>legendary</span> cat at least.</p>
                <p>Contains 1 <span style={{color: 'rgb(250,176,90)'}}>legendary</span> avatar frame.</p>
              </>),
  },
]


const boxColors = [
  'rgb(144,213,115)',
  'rgb(93,179,238)',
  'pink',
  'rgb(180, 116, 203)',
  'rgb(250,176,90)',
]

function waitMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, debugName) {
  debugName |= ""
  var retryCount = 0;
  while(true) {
    try {
      let ret = await fn()
      return ret;
    } catch (e) {
      console.log(`retry, name: ${debugName}, e: ${e}`)
      retryCount++;
      await waitMs((1 << Math.min(retryCount, 6)) * 1000)
    }
  }
}

async function requestBlindBoxStaticInfo(blindBox) {
  return await retry(async ()=>{
    let ret = await blindBox.getBlindBoxViewInfos()
    // console.log(ret)
    return ret;
  }, "requestBlindBoxStaticInfo")
}


const Buy = () => {
  const [rocBlindBox, setRocBlindBox] = useState(null)
  const [cateCoin, setCateCoin] = useState(null)
  const [rocNFT, setRocNFT] = useState(null)
  const rocBlindBoxRef = useRef()
  rocBlindBoxRef.current = rocBlindBox


  const [rocBlindBoxRW, setRocBlindBoxRW] = useState(null)
  const [cateCoinRW, setCateCoinRW] = useState(null)
  const rocBlindBoxRWRef = useRef()
  const cateCoinRWRef = useRef()
  rocBlindBoxRWRef.current = rocBlindBoxRW
  cateCoinRWRef.current = cateCoinRW

  const [signer, setSigner] = useState(null)
  const signerRef = useRef()
  signerRef.current = signer


  const [needApprove, setNeedApprove] = useState(true)
  const [userAllowance, setUserAllowance] = useState(BigNumber.from(0))
  const [leftPriceAmount, setLeftPriceAmount] = useState(BigNumber.from(-1))
  const [isRightChain, setIsRightChain] = useState(false)

  const needApproveRef = useRef()
  needApproveRef.current = needApprove
  const userAllowanceRef = useRef()
  userAllowanceRef.current = userAllowance
  const leftPriceAmountRef = useRef()
  leftPriceAmountRef.current = leftPriceAmount
  const isRightChainRef = useRef()
  isRightChainRef.current = isRightChain

  const {
    web3Modal,
    provider,
    selectedAccount,
    fetchAccountData,
    onConnect,
    onDisconnect,
  } = useWeb3Modal()

  const selectedAccountRef = useRef()
  selectedAccountRef.current = selectedAccount


  // 1633017600000
  const [startTime, setStartTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime))
  const [isStartSell, setIsStartSell] = useState(startTime > 0 && timeLeft == null)

  // 倒计时
  useEffect(() => {
    let timer = setTimeout(() => {
        console.log("startTime: " + startTime)
        const left = calculateTimeLeft(startTime)
        setTimeLeft(left)
        setIsStartSell(startTime > 0 && left == null);
      }, 1000)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [timeLeft, startTime])


  const [decimals, setDecimals] = useState(9)
  const [symbol, setSymbol] = useState("")
  const decimalsRef = useRef()
  decimalsRef.current = decimals
  const symbolRef = useRef()
  symbolRef.current = symbol

  const formatPrice = (price)=> {
    if (typeof price === 'undefined') {
      return ''
    }
    return ethers.utils.commify(ethers.utils.formatUnits(price, decimalsRef.current)) + " " + symbolRef.current
  }

  let modelBlindBoxesInit = []
  for (let i=0; i < BlindBoxes.length; i++) {
    var boxModel = {
      viewData: BlindBoxes[i],
      staticData: null,
      userData: null,
      active: i == 0
    }

    modelBlindBoxesInit.push(boxModel);
  }
  const [modelBlindBoxes, setModelBlindBoxes] = useState(modelBlindBoxesInit)
  const modelBlindBoxesRef = useRef()
  modelBlindBoxesRef.current = modelBlindBoxes

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedIndexRef = useRef()
  selectedIndexRef.current = selectedIndex

  const [buyNum, setBuyNum] = useState(EACH_LIMIT_COUNT)
  const [curCanBuyCount, setCurCanBuyCount] = useState(EACH_LIMIT_COUNT)

  const getSelectedBoxModel = ()=> {
    // console.log("selectedBox: ", selectedIndexRef.current)
    return modelBlindBoxesRef.current[selectedIndexRef.current]
  }

  const fetchUserAllowance = async ()=>{
    if (selectedAccountRef.current == null || cateCoin == null || rocBlindBoxRef.current == null) {
      setUserAllowance(BigNumber.from(0))
      return;
    }
    // [BigNumber] 获取用户对盲盒合约授权的货币数量
    let currentAllowance = await cateCoin.allowance(
      selectedAccountRef.current,
      rocBlindBoxRef.current.address
    )
    setUserAllowance(currentAllowance)
  }

  const recalcLeftPriceAmount = ()=> {
    let modelBoxes = modelBlindBoxesRef.current
    var total = BigNumber.from(0)

    for (let i=0; i<modelBoxes.length; i++) {
      let modelBox = modelBoxes[i]
      if (modelBox.staticData == null) {
        setLeftPriceAmount(BigNumber.from(-1))
        return;
      }
      let price = modelBox.staticData.price
      let num = EACH_LIMIT_COUNT
      if (modelBox.userData != null) {
        num = modelBox.userData.leftLimitBuyCount
      }
      if (modelBox.staticData != null) {
        num = Math.min(num, modelBox.staticData.leftCount);
      }
      total = total.add(price.mul(num))
    }
    setLeftPriceAmount(total)
  }

  const updateCurCanBuyCount = ()=> {
    let modelBox = getSelectedBoxModel()
    let num = EACH_LIMIT_COUNT
    // console.log(modelBox)
    if (modelBox.userData != null) {
      num = modelBox.userData.leftLimitBuyCount;
    }
    if (modelBox.staticData != null) {
      num = Math.min(num, modelBox.staticData.leftCount);
    }
    setCurCanBuyCount(num)
    setBuyNum(Math.min(Math.max(buyNum, 1), num))
  }

  const fetchBlindBoxViewData = async () => {
      if (rocBlindBoxRef.current == null) {
        return;
      }
      console.log("fetchBlindViewData start")
      let info = await requestBlindBoxStaticInfo(rocBlindBoxRef.current);
      // console.log(info)
      let newModelBlindBoxes = []
      let modelBoxes = modelBlindBoxesRef.current
      for (let i=0; i<modelBoxes.length; i++) {
        let cBoxInfo = info[i]
        let staticData = {
          total: cBoxInfo.totalCount,
          sold: cBoxInfo.soldCount,
          price: cBoxInfo.price
        }
        staticData.leftCount = staticData.total - staticData.sold
        staticData.priceStr = formatPrice(staticData.price)
        var newBox = {...modelBoxes[i]}
        newBox.staticData = staticData
        newModelBlindBoxes.push(newBox)
      };
      modelBlindBoxesRef.current = newModelBlindBoxes;
      setModelBlindBoxes(newModelBlindBoxes)
      updateCurCanBuyCount();
      recalcLeftPriceAmount()
      console.log("fetchBlindViewData complete")
  };

  const fixedUpdateBlindBoxViewData = async ()=>{
    if (rocBlindBoxRef.current == null) {
      return;
    }
    while(true) {
      await fetchBlindBoxViewData()
      await waitMs(30000)
    }
  };

  const updateRWBlindBoxContract = async ()=>{
    if (signerRef.current == null || !isRightChainRef.current) {
      rocBlindBoxRWRef.current = null
      cateCoinRWRef.current = null
      setRocBlindBoxRW(null)
      setCateCoinRW(null)
      return;
    }
    const { rocBlindBoxRW, cateCoinRW } = await getSignBlockChain(
      signerRef.current
    )
    // console.log({ cateCoin })
    rocBlindBoxRWRef.current = rocBlindBoxRW
    cateCoinRWRef.current = cateCoinRW
    setRocBlindBoxRW(rocBlindBoxRW)
    setCateCoinRW(cateCoinRW)
  }

  const fetchBlindBoxUserData = async ()=>{
    let leftLimitCountAry = null
    if (isRightChainRef.current && rocBlindBoxRWRef.current != null && selectedAccountRef.current != null) {
      leftLimitCountAry = await rocBlindBoxRWRef.current.getAllLeftLimitBuyCount(selectedAccountRef.current)
    }
    let newModelBlindBoxes = []
    let modelBoxes = modelBlindBoxesRef.current

    for (let i=0; i<modelBoxes.length; i++) {
      let userData = null
      if (leftLimitCountAry != null) {
        userData = {
          leftLimitBuyCount: leftLimitCountAry[i]
        }
      }
      var newBox = {...modelBoxes[i]}
      newBox.userData = userData
      newModelBlindBoxes.push(newBox)
    };
    console.log(newModelBlindBoxes)
    modelBlindBoxesRef.current = newModelBlindBoxes
    setModelBlindBoxes(newModelBlindBoxes)
    recalcLeftPriceAmount()
    updateCurCanBuyCount()
  };


  const init = async () => {
    const { rocBlindBox, cateCoin, rocNFT } = await getBlockchain()
    rocBlindBoxRef.current = rocBlindBox
    setRocBlindBox(rocBlindBox)
    setCateCoin(cateCoin)
    setRocNFT(rocNFT)
  // console.log(cateCoin)
    let decimals = await cateCoin.decimals() // 18
    let symbol = await cateCoin.symbol()
    setDecimals(decimals)
    setSymbol(symbol)

    let newModelBlindBoxes = []
    let modelBoxes = modelBlindBoxesRef.current
    let needRefresh = true

    for (let i=0; i<modelBoxes.length; i++) {
      var newBox = {...modelBoxes[i]}
      if (newBox.staticData != null) {
        newBox.staticData.priceStr = formatPrice(newBox.staticData.price)
      } else {
        needRefresh = false
        break
      }
      newModelBlindBoxes.push(newBox)
    };
    if(needRefresh) {
      // console.log(newModelBlindBoxes)
      modelBlindBoxesRef.current = newModelBlindBoxes
      setModelBlindBoxes(newModelBlindBoxes)
    }

    rocBlindBox.startSellTime().then((time) => {
      console.log(time.toNumber())
      setStartTime(time.toNumber() * 1000)
    })
  }

  useEffect(() => {
    init().catch(e => {
      console.log(e)
      setShowAlert(true)
      setAlertMsg('Request NFTs failed, please reload and try again')
    })
  }, [])

  // 定期拉取盲盒信息，刷新剩余数量
  useEffect(() => {
    fixedUpdateBlindBoxViewData()
  }, [rocBlindBox])

  // 监听登录的账户变化，设置Signer，拉取用户已授权货币数量
  useEffect(() => {
    setSigner(provider?.getSigner())
    fetchUserAllowance()
    if(selectedAccount == null) {
      setIsRightChain(false)
    }
    if (showBuyModal && !isBuying) {
      setShowBuyModal(false);
    }
  }, [selectedAccount, cateCoin, rocBlindBox])


  // 监听Signer变化，重新创建读写合约对象
  useEffect(() => {
    updateRWBlindBoxContract();
  }, [signer, isRightChain])

  // 监听读写合约变化，重新拉取用户盲盒已购买数据
  useEffect(() => {
    fetchBlindBoxUserData();
  }, [rocBlindBoxRW])


  // 监听还需授权金额和已授权金额，更新是否需要授权
  useEffect(() => {
    console.log("leftPriceAmount: ", leftPriceAmount.toString())
    console.log("userAllowance: ", userAllowance.toString())
    setNeedApprove(leftPriceAmount.lt(0) || userAllowance.lt(leftPriceAmount))
  }, [leftPriceAmount, userAllowance])

  // 登录后，刷新，自动连接获取钱包地址
  useEffect(()  => {
    const loggedIn = localStorage.getItem('LoggedIn')
    const injected = localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')
    if (loggedIn && injected) {
      if (web3Modal) {
        handleLogin()
      }
    }
  }, [web3Modal])

  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  const handleCloseAlert = () => {
    setShowAlert(false)
    setAlertMsg('')
  }

  const handleLogin = async () => {
    try {
      const { provider, connect } = await onConnect()
      // console.log(provider)
      // Subscribe to chainId change
      connect.on("chainChanged", async (chainId) => {
        console.log('----->chainChanged', chainId)
        const idBn = BigNumber.from(chainId)
        console.log("new chain Id: ", idBn.toString(), ", equals: ", idBn.toString() === CHAIN_ID)
        if (idBn.toString() !== CHAIN_ID) {
          isRightChainRef.current = false;
          setIsRightChain(isRightChainRef.current)
          setShowAlert(true)
          setAlertMsg('Please choose bsc network chain before buying cats')
          return
        }
        isRightChainRef.current = true;
        setIsRightChain(isRightChainRef.current)
        await fetchAccountData(provider);
      });

      setIsRightChain(false)
      const network = await provider.getNetwork()
      console.log("network: ", network.chainId, ", equal: ", network.chainId == CHAIN_ID)
      isRightChainRef.current = (network.chainId == CHAIN_ID);
      setIsRightChain(isRightChainRef.current)
      if (!isRightChainRef.current) {
        return
      }

      const { rocBlindBoxRW, cateCoinRW } = await getSignBlockChain(
        provider.getSigner()
      )
      // console.log({ cateCoin })
      rocBlindBoxRWRef.current = rocBlindBoxRW
      setRocBlindBoxRW(rocBlindBoxRW)
      cateCoinRWRef.current = cateCoinRW
      setCateCoinRW(cateCoinRW)
      await fetchUserAllowance();
    } catch (e) {
      if (typeof e === 'string') {
        setShowAlert(true)
        setAlertMsg(e)
      }
    }
  }

  const handleLogout = async () => {
    await onDisconnect()
  }


  const [showSuccess, setShowSuccess] = useState(false)


  const [showBuyModal, setShowBuyModal] = useState(false)

  const [showLimit, setShowLimit] = useState(false)

  const [blindBoxCats, setBlindBoxCats] = useState([])

  // 点击购买确认按钮，先校验限购数量
  const handleBuy = async () => {
    if (isBuying) {
      return
    }
    if (selectedAccount == null) {
      setShowAlert(true)
      setAlertMsg('Please Login first')
      return
    }
    if (buyNum <= 0) {
      return;
    }

    // 开启loading
    setIsBuying(true)
    // window.scrollTo(0, 0)

    // 记着调用授权额度的时候要把数量乘到价格上，let amount = price.mul(count)
    // 超过限购数量

    // 用户的地址
    let selfAddress = selectedAccount

    if (!isRightChain || rocBlindBoxRWRef.current == null) {
      setShowAlert(true)
      console.log("tip 1")
      setAlertMsg('Please choose the bsc network chain before buying cats')
      setIsBuying(false)
      return
    }

    let modelBox = getSelectedBoxModel()

    try {
      const price = modelBox.staticData.price
      const amount = price.mul(buyNum)

      // 钱包余额
      const userBalance = await cateCoin.balanceOf(selfAddress)
      if (!userBalance.gte(amount)) {
        setShowAlert(true)
        setAlertMsg(`Not enough ${symbol}`)
        setIsBuying(false)
        return
      }
    } catch (e) {
      // TODO: User denied transaction signature 4001
      // console.log(e.code)
      if ((e.data && e.data.message || e.message).match(/User denied transaction signature/)) {
        setShowAlert(true)
        setAlertMsg('User denied transaction signature')
      }
      setIsBuying(false)
      return
    }

    // TODO: denied check

    try {
      // 购买盲盒
      // console.log(buyNum)
      const txPay = await rocBlindBoxRWRef.current.payByToken(selectedIndexRef.current, buyNum)
      let receipt = await txPay.wait()

      // 购买成功
      // 更新盲盒数据s

      fetchBlindBoxViewData()
      fetchBlindBoxUserData()
      fetchUserAllowance()
      // init().catch(e => {
      //   setShowAlert(true)
      //   setAlertMsg('Request NFTs failed, please reload and try again')
      // })

      // 通过事件获取购买的盲盒中的猫咪的tokenId列表
      let openedEvent = receipt.events.pop()
      // console.log(openedEvent)
      const tokenIds = openedEvent.args.tokenIds
      setShowBuyModal(false)


      const strTokenIds = tokenIds.map((id) => id.toString()).join(',')

      // 盲盒商品信息tokenIds
      const metaDataAryResp = await axios.get(
        `https://nft.riseofcats.com/cats/${strTokenIds}`
      )
      // 盲盒数据
      // console.log(metaDataAryResp)
      setBlindBoxCats(metaDataAryResp.data)
      setShowSuccess(true)

      // loading结束
      setIsBuying(false)
    } catch (e) {
      console.log(e)
      // 提示CATE币不足
      // if (e.data) {
      //   alert(e.data?.message)
      // }
      if ((e.data && e.data.message || e.message).match(/not start to sell/)) {
        setShowAlert(true)
        setAlertMsg('Not start to sell')
      }

      if ((e.data && e.data.message || e.message).match(/User denied transaction signature/)) {
        setShowAlert(true)
        setAlertMsg('User denied transaction signature')
      }

      if ((e.data && e.data.message || e.message).match(/you can't buy more/)) {
        setShowAlert(true)
        setAlertMsg("You can't buy more")
      }

      if ((e.data && e.data.message || e.message).match(/stock not enough/)) {
        setShowAlert(true)
        setAlertMsg("Stock not enough")
      }

      if ((e.data && e.data.message || e.message).match(/token allowance not enough/)) {
        setShowAlert(true)
        setAlertMsg("Token allowance not enough")
      }

      // loading结束
      setIsBuying(false)
    }

  }

  const handleClickBox = (index) => {
    let modelBoxes = modelBlindBoxesRef.current
    let boxModel = modelBoxes[index]
    // console.log(index)
    // console.log(boxModel)
    if (boxModel.staticData == null || boxModel.staticData.leftCount > 0) {
      let oldInx = selectedIndexRef.current;
      selectedIndexRef.current = index
      setSelectedIndex(index)
      // console.log("after set selected index: ", selectedIndexRef.current)
      if(oldInx != index) {
        let newModel = [...modelBoxes]
        let oldBox = {...modelBoxes[oldInx]}
        oldBox.active = false
        newModel[oldInx] = oldBox

        let newBox = {...modelBoxes[index]}
        newBox.active = true
        newModel[index] = newBox
        setModelBlindBoxes(newModel)

        // console.log(newModel)
      }

      updateCurCanBuyCount()
    }
  }

  const [isBuying, setIsBuying] = useState(false)

  // 一次授权
  const [isApproving, setIsApproving] = useState(false)
  const handleApprove = async () => {
    if (isApproving) {
      return
    }
    if (!needApprove) {
      return
    }

    setIsApproving(true)
    if (!selectedAccount) {
      await handleLogin()
    }
    if (selectedAccountRef.current == null) {
      setIsApproving(false)
      return;
    }
    if (!isRightChainRef.current) {
      setShowAlert(true)
      console.log("tip 2")
      setAlertMsg('Please choose the bsc network chain before buying cats')
      setIsApproving(false)
      return
    }

    if (!needApproveRef.current || cateCoinRWRef.current == null || leftPriceAmountRef.current.lt(0)) {
      setIsApproving(false)
      return
    }


    console.info("approve amount: ", leftPriceAmountRef.current.toString())
    try {
      const txApprove = await cateCoinRWRef.current.approve(rocBlindBox.address, leftPriceAmountRef.current)
      await txApprove.wait()
      await fetchUserAllowance();
    } catch(e) {
      if (e.message.match(/User denied transaction signature/)) {
        setShowAlert(true)
        setAlertMsg('User denied transaction signature')
      }
    } finally {
      setIsApproving(false)
    }
  }
  return (
    <div style={{ backgroundColor: 'rgb(205,205,205)' }}>
      <div
        className={`w-full lg:max-w-280 min-h-full mx-auto shadow-2xl bgImg`}
      >
        <div className="flex justify-between items-center py-5 px-5">
          <div
            className="flex items-center space-x-1 text-red-600 font-medium leading-none cursor-pointer"
            onClick={() => {
              history.back()
            }}
          >
            <div className="arrow-left"></div>
            <div className="border-b border-solid border-red-600 pb-1">
              Return
            </div>
          </div>

          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-red-600 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            {!selectedAccount && (
              <div
                className="text-red-600 font-medium leading-none cursor-pointer"
                onClick={handleLogin}
              >
                <div className="border-b border-solid border-red-600 pb-1">
                  Login
                </div>
              </div>
            )}

            {selectedAccount && (
              <a href="/profile" target="_blank" className="text-red-600 font-medium leading-none text-xs mr-2 hover:underline">
                {selectedAccount.slice(0, 6) +
                  '...' +
                  selectedAccount.slice(-4)}
              </a>
            )}

            {selectedAccount && (
              <div
                className="text-red-600 font-medium leading-none cursor-pointer"
                onClick={handleLogout}
              >
                <div className="border-b border-solid border-red-600 pb-1">
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="text-center font-bold text-xl md:text-2xl"
          style={{ color: 'rgb(97,48,18)' }}
        >
          Rise of Cats - Origin Cats NFT Blind Box
        </div>

        <div
          className="mx-4 sm:mx-12 mt-2 mb-6"
          style={{ border: '1px solid rgb(222,215,194)' }}
        ></div>

        <style jsx>
          {`
            .bgImg {
              background: url('/bg-buy.png') 0 0 no-repeat;
              background-size: cover;
            }
            .bg-top-buy {
              min-height: 382px;
              border: 20px solid transparent;
              border-image: url('/bg-top-buy.png') 30 round;
              background-color: rgb(222, 213, 193);
            }
            .btn-buy {
              background: url('/bg-btn.png') 0 0 no-repeat;
              background-size: 100% 100%;
            }
            .btn-buy-gray {
              background: url('/bg-btn-gray.png') 0 0 no-repeat;
              background-size: 100% 100%;
            }
            .btn-confirm {
              background: url('/bg-top-buy.png') center no-repeat;
              background-size: 100%;
            }
          `}
        </style>

        <Alert show={showAlert} onClose={handleCloseAlert} msg={alertMsg} />

        {/* cat info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-4 sm:mx-12">
        {
          modelBlindBoxesRef.current?.map((box, index) => {
            return <NFT
              key={index}
              index={index}
              model={box}
              onClick={handleClickBox}
            />
          })
        }
        </div>
        {/* cat info end */}

        <div className="flex flex-col items-center justify-center mx-3">
          {/*购买未开始，倒计时*/}
          {!isStartSell && timeLeft != null && (
            <div className="flex items-center space-x-1 mt-8">
              {String(timeLeft.days)
                .padStart(2, '0')
                .split('')
                .map((item, index) => (
                  <div key={index} className="text-green-600 rounded-lg flex items-center justify-center font-bold">
                    {item}
                  </div>
                ))}
              <div
                className="font-bold px-1"
                style={{ color: 'rgb(91,50,25)' }}
              >
                Days
              </div>
              {String(timeLeft.hours)
                .padStart(2, '0')
                .split('')
                .map((item, index) => (
                  <div key={index} className="text-green-600 rounded-lg flex items-center justify-center font-bold">
                    {item}
                  </div>
                ))}

              <div className="font-bold px-1">:</div>
              {String(timeLeft.minutes)
                .padStart(2, '0')
                .split('')
                .map((item, index) => (
                  <div key={index} className="text-green-600 rounded-lg flex items-center justify-center font-bold">
                    {item}
                  </div>
                ))}

              <div className="font-bold px-1">:</div>
              {String(timeLeft.seconds)
                .padStart(2, '0')
                .split('')
                .map((item, index) => (
                  <div key={index} className="text-green-600 rounded-lg flex items-center justify-center font-bold">
                    {item}
                  </div>
                ))}
            </div>
          )}

          {/*TODO: Approve CATE 授权一次，另一个按钮*/}
          {/*购买开始了 py-4 md:py-8*/}
          {isStartSell && (
            <div className="flex flex-col md:flex-row justify-center items-center mt-10">
              <div
                  className={classNames(
                      'btn-buy flex justify-center items-center cursor-pointer font-medium text-xl lg:text-2xl px-6' +
                      ' py-5 lg:-ml-1.5 transform scale-75 md:scale-100',
                      needApprove && 'btn-buy cursor-pointer',
                      !needApprove && 'btn-buy-gray cursor-default'
                  )}
                  style={{ color: 'rgb(91,50,25)' }}
                  onClick={handleApprove}
              >
                {isApproving && (
                    <>
                      <Loader />
                      <span className="ml-1">Pending </span>
                    </>
                )}
                <span>Approve CATE</span>
              </div>

              <div className="flex-1 flex items-center">
                <div className="hidden md:inline-block text-3xl mx-3 lg:mx-10" style={{ color: 'rgb(245,193,82)' }}>
                  <BsArrowRightSquareFill />
                </div>
                <div className="md:hidden inline-block text-3xl mx-3 lg:mx-10" style={{ color: 'rgb(245,193,82)' }}>
                  <BsArrowDownSquareFill />
                </div>
              </div>

              <div
                className={classNames(
                    'btn-buy flex justify-center items-center font-medium text-xl lg:text-2xl px-12' +
                    ' py-5 transform scale-75 md:scale-100',
                    !needApprove && 'btn-buy cursor-pointer', needApprove && 'btn-buy-gray cursor-default',
                )}
                style={{ color: 'rgb(91,50,25)' }}
                onClick={async () => {

                  if (needApprove) {
                    return
                  }

                  if (!selectedAccount) {
                    await handleLogin()
                  } else {
                    if (!isRightChain) {
                      setShowAlert(true)
                      console.log("tip 3")
                      setAlertMsg('Please choose the bsc network chain before buying cats')
                      return
                    }
                    window.scrollTo(0, 0)
                    setBuyNum(Math.min(EACH_LIMIT_COUNT, curCanBuyCount))
                    setShowBuyModal(true)
                  }
                }}
              >
                Buy Now
              </div>
            </div>
          )}
        </div>

        <div
          className="text-center my-4 text-sm lg:text-base font-medium"
          style={{ color: 'rgb(129,109,88)' }}
        >
          Each player can purchase up to
          <span style={{ color: 'rgb(84,19,0)' }}> 2 </span> of each kind of the blind boxes.
        </div>

        <div
          className="mx-4 sm:mx-12"
          style={{ border: '1px solid rgb(222,215,194)' }}
        ></div>

        {/*description*/}
        <div
          className="px-5 pb-11 sm:px-12 text-sm"
          style={{ color: 'rgb(91,50,25)' }}
        >
          <div className="mt-7">
            <div className="pb-3 text-xl md:text-2xl font-bold">CateCoin Exclusive NFT Community subscription</div>
            <p style={{ color: 'rgb(138, 124, 106)' }}
               className="break-words text-sm md:text-base leading-normal font-medium">
              2800 blind boxes, Each box contains 5 cats.
            </p>
            <p style={{ color: 'rgb(138, 124, 106)' }} className="mt-2 break-words text-sm md:text-base leading-normal font-medium">
              Maximum buy limit: Each player can buy 2 boxes from every rarity, Total 8 boxes.
            </p>
            <p style={{ color: 'rgb(138, 124, 106)' }}
               className="mt-2 break-words text-sm md:text-base leading-normal font-medium">
              Benefit: Player who purchase(except common box) will get Exclusive Profile pic Frame.
            </p>
            <p style={{ color: 'rgb(138, 124, 106)' }}
               className="mt-2 break-words text-sm md:text-base leading-normal font-medium">
              Exclusive Profile pic frame holders earn extra Rewards in Game & can participate in Game community decision making through voting.
            </p>
            <p style={{ color: 'rgb(138, 124, 106)' }}
               className="mt-2 break-words text-sm md:text-base leading-normal font-medium">
              <span className="" style={{color: 'rgb(255, 167, 47)'}}>Note: </span>You won't get Profile pic Frame during normal NFT sales. So this is very valuable.
            </p>
          </div>

          <div className="mt-7">
            <div className="pb-3 text-xl md:text-2xl font-bold">Product Description</div>
            <p
              style={{ color: 'rgb(138, 124, 106)' }}
              className="break-words text-sm md:text-base leading-normal font-medium"
            >
              Collect over 40 kinds of cute cats, use their special skills to fight off your opponents or co-op with
              friends to defeat enemies! Rise of Cats is a cat themed fast paced random TD game, each game only takes 3
              minutes! Enjoy the fun and aggressive cat arena!
            </p>
            <p
                style={{ color: 'rgb(138, 124, 106)' }}
                className="mt-2 break-words text-sm md:text-base leading-normal font-medium"
            >
              Each blind box contains 5 cats.
            </p>

            <p
                style={{ color: 'rgb(138, 124, 106)' }}
                className="mt-2 break-words text-sm md:text-base leading-normal font-medium"
            >
              More details: <a href="https://wiki.catecoin.club/cats-details" target="_blank" className="text-FFA72F underline">https://wiki.catecoin.club/cats-details</a>
            </p>
          </div>

          {/*Profile Pic Frames*/}
          <div className="mt-6 bg-f9f2e2 p-3 pb-4 border-2 border-4b4b4b">
            <div className="pb-3 text-xl md:text-2xl font-bold">
              Profile Pic Frames
              <span className="text-sm font-normal"> (limited and only available during Community subscription Sale)</span>
            </div>
            <p
              style={{ color: 'rgb(138, 124, 106)' }}
              className="break-words md:text-base text-sm leading-normal font-medium"
            >
              Profile Pic frames are a form of extremely valuable and rare in game assets, which can only be obtained in limited quantities through community subscription.
              Profile pic frames can be seen by every player in game and show your status to other players.
            </p>
            <p style={{ color: 'rgb(138, 124, 106)' }}
               className="mt-2 break-words md:text-base text-sm leading-normal font-medium">
              Players with rare, epic or legendary frames are VIP players who have the following bonus:
            </p>
            <ol
                style={{ color: 'rgb(138, 124, 106)' }}
                className="mt-2 list-inside list-decimal break-words md:text-base text-sm leading-normal font-medium"
            >
              <li className="indent">Get bonus in the game, such as increased rewards, increased game times, etc.</li>
              <li>Get generous rewards from time to time.</li>
              <li>Participate in community decision-making voting and determine the future development of the game.</li>
            </ol>
            <p
                style={{ color: 'rgb(138, 124, 106)' }}
                className="mt-2 break-words text-sm md:text-base leading-normal font-medium"
            >
              More details: <a href="https://wiki.catecoin.club/player-profile-pic-frame" target="_blank" className="text-FFA72F underline">https://wiki.catecoin.club/player-profile-pic-frame</a>
            </p>
            <div className="flex mt-3 justify-around">
              <div className="flex flex-1 flex-col items-center border-r border-dad4bb">
                <img src="/frame1.png" alt="" className="w-20 md:w-24 h-auto" />
                <span className="text-[12px]">Rare frame</span>
              </div>

              <div className="flex flex-1 flex-col items-center border-r border-dad4bb">
                <img src="/frame2.png" alt="" className="w-20 md:w-24 h-auto" />
                <span className="text-[12px]">Epic frame</span>
              </div>

              <div className="w-px h-full bg-dad4bb"></div>

              <div className="flex flex-1 flex-col items-center">
                <img src="/frame3.png" alt="" className="w-20 md:w-24 h-auto" />
                <span className="text-[12px]">Legendary frame</span>
              </div>
            </div>
          </div>
          {/*Profile Pic Frames end*/}

          {/*Total NFT Cats Details*/}
          <div className="mt-8 font-bold" style={{ color: 'rgb(91,50,25)' }}>
            <div className="pb-6 text-xl">Total NFT Cats Details</div>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden sm:rounded-lg">
                    <table
                      className="min-w-full"
                      style={{ color: 'rgb(138, 124, 106)' }}
                    >
                      <thead className="">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-md tracking-wider"
                          >
                            Rarity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-md tracking-wider"
                          >
                            Number
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-md tracking-wider"
                          >
                            Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cats.map((cat, catIdx) => (
                          <tr key={cat.name} style={{ color: cat.color }}>
                            <td className="px-3 py-4 whitespace-nowrap text-md">
                              {cat.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-md font-medium">
                              {cat.number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-md font-medium">
                              {cat.rate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*Total NFT Cats Details end*/}

          {/*Blind Boxes Rate Details*/}
          <div className="mt-8 font-bold" style={{ color: 'rgb(91,50,25)' }}>
            <div className="pb-6 text-xl">Blind Boxes Rate Details</div>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden sm:rounded-lg">
                    <table
                      className="min-w-full"
                      style={{ color: 'rgb(138, 124, 106)' }}
                    >
                      <thead className="">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-md tracking-wider"
                          >
                            Rarity
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                          >
                            Common Cats
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                            style={{ color: boxColors[0] }}
                          >
                            Uncommon Cats
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                            style={{ color: boxColors[1] }}
                          >
                            Rare Cats
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                            style={{ color: boxColors[2] }}
                          >
                            Unique Cats
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                            style={{ color: boxColors[3] }}
                          >
                            Epic Cats
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-3 text-left text-md font-normal tracking-wider"
                            style={{ color: boxColors[4] }}
                          >
                            Legendary Cats
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {BlindBoxes.map((box, boxIdx) => (
                          <tr key={box.name} style={{ color: box.color }}>
                            <td className="px-3 py-4 whitespace-nowrap text-md">
                              {box.name}
                            </td>
                            <td className="px-1 py-4 whitespace-nowrap text-md font-medium">
                              {box.common}
                            </td>
                            <td
                              className="px-1 py-4 whitespace-nowrap text-md font-medium"
                              style={{ color: `${boxColors[0]}` }}
                            >
                              {box.uncommon}
                            </td>
                            <td
                              className="px-1 py-4 whitespace-nowrap text-md font-medium"
                              style={{ color: `${boxColors[1]}` }}
                            >
                              {box.rare}
                            </td>
                            <td
                              className="px-1 py-4 whitespace-nowrap text-md font-medium"
                              style={{ color: `${boxColors[2]}` }}
                            >
                              {box.unique}
                            </td>
                            <td
                              className="px-1 py-4 whitespace-nowrap text-md font-medium"
                              style={{ color: `${boxColors[3]}` }}
                            >
                              {box.epic}
                            </td>
                            <td
                              className="px-1 py-4 whitespace-nowrap text-md font-medium"
                              style={{ color: `${boxColors[4]}` }}
                            >
                              {box.legendary}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*Blind Boxes Rate Details end*/}
        </div>

        {/*buy modal*/}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black opacity-50"></div>
        )}
        {showBuyModal && (
          <div
            className="w-10/12 md:w-auto absolute left-1/2 top-0 mt-36 px-8 md:px-10 pt-5 pb-5 transform -translate-x-1/2 rounded-md"
            style={{ backgroundColor: 'rgb(248,242,228)' }}
          >
            <div
              className="absolute top-2 right-2 w-8 h-8 cursor-pointer"
              onClick={() => {
                if (isBuying && !showSuccess) {
                  return
                }
                setBuyNum(Math.min(EACH_LIMIT_COUNT, curCanBuyCount))
                setShowBuyModal(false)
                setIsBuying(false)
              }}
            >
              <img src="/btn-close.png" layout="fill" />
            </div>

            <div
              className="py-10 text-xl md:text-2xl text-gray-800 font-bold text-center"
              style={{ color: 'rgb(91,50,25)' }}
            >
              Buy Rise of Cats - Origin Cats NFT
            </div>

            <div className="flex flex-col space-y-8 px-0 md:pl-10">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-20 font-medium" style={{ color: 'rgb(138,124,106)' }}>
                  Type
                </div>
                <div className="flex items-center select-none">
                  <span className="leading-5">Rare box</span>
                  { getSelectedBoxModel().staticData != null && <span className="ml-4 text-gray-400 text-sm leading-5">{`${getSelectedBoxModel().staticData.leftCount}/${getSelectedBoxModel().staticData.total} Remaining`}</span> }
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-20 font-medium" style={{ color: 'rgb(138,124,106)' }}>
                  Number
                </div>
                <div className="flex items-center select-none">
                  <div className="flex border border-gray-300">
                    <div
                        className="flex justify-center items-center w-8 h-8 cursor-pointer text-xl border-r border-gray-300"
                        onClick={() => {
                          if (buyNum > 1) {
                            setBuyNum((num) => parseInt(num) - 1)
                          }
                        }}
                    >
                      -
                    </div>
                    <input
                        value={buyNum}
                        readOnly
                        className="w-10 h-8 text-center"
                        onChange={() => {}}
                    />
                    <div
                        className="flex justify-center items-center w-8 h-8 cursor-pointer text-xl border-l border-gray-300"
                        onClick={() => {
                          if (buyNum < curCanBuyCount) {
                            setBuyNum((num) => parseInt(num) + 1)
                          }
                        }}
                    >
                      +
                    </div>
                  </div>
                </div>

                {getSelectedBoxModel().userData != null && <div className="ml-4 text-gray-400 text-sm">{`${EACH_LIMIT_COUNT - getSelectedBoxModel().userData.leftLimitBuyCount}/${EACH_LIMIT_COUNT} Purchase limit`}</div>}
              </div>

              <div className="flex items-center">
                <div className="w-20 font-medium" style={{ color: 'rgb(138,124,106)' }}>
                  Price
                </div>
                <div
                  className="flex items-center"
                  style={{ color: 'rgb(91,50,25)' }}
                >
                  <div>
                    {formatPrice(getSelectedBoxModel().staticData?.price.mul(buyNum))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <div
                className={classNames(
                  'flex items-center btn-buy px-6 py-3 font-medium text-xl md:text-2xl',
                    buyNum === 0 && 'btn-buy-gray cursor-default',
                  (isBuying || buyNum <= 0) && 'cursor-default',
                  !(isBuying || buyNum <= 0) && 'cursor-pointer'
                )}
                style={{ color: 'rgb(91,50,25)' }}
                onClick={handleBuy}
              >
                {isBuying && (
                  <>
                    <Loader />
                    <span className="ml-1">Pending</span>
                  </>
                )}
                {!isBuying && <span>Confirm</span>}
              </div>
            </div>
          </div>
        )}

        {/*buy limit modal*/}
        {showLimit && <div className="fixed inset-0 bg-black opacity-50"></div>}
        {showLimit && (
          <div
            className="absolute left-1/2 top-0 w-80 h-56 mt-36 transform -translate-x-1/2 rounded-md"
            style={{ backgroundColor: 'rgb(248,242,228)' }}
          >
            <div
              className="absolute top-2 right-2 w-8 h-8 cursor-pointer"
              onClick={() => setShowLimit(false)}
            >
              <img src="/btn-close.png" layout="fill" />
            </div>

            <div
              className="py-10 text-xl md:text-2xl text-gray-800 font-bold text-center"
              style={{ color: 'rgb(91,50,25)' }}
            >
              Buy Tip
            </div>

            <div className="px-10">
              <div
                className="py-2 font-medium text-center cursor-pointer text-md md:text-xl"
                style={{ color: 'rgb(91,50,25)' }}
              >
                Purchase limit exceeded!
              </div>
            </div>
          </div>
        )}

        {/*buy success modal*/}
        {showSuccess && (
          <div className="fixed inset-0 bg-black opacity-50"></div>
        )}
        {showSuccess && (
          <div
            className="absolute left-1/2 top-0 mt-36 transform -translate-x-1/2 w-4/5 max-w-224 p-10 rounded-md"
            style={{ backgroundColor: 'rgb(248,242,228)' }}
          >
            <div
              className="mb-7 text-4xl text-gray-800 font-bold text-center"
              style={{ color: 'rgb(92,59,27)' }}
            >
              Payment success
            </div>

            <div
              style={{ color: 'rgb(131,93,51)' }}
              className="text-center text-2xl pb-5"
            >
              Your payment is successfully completed!
            </div>

            <div
              style={{ color: 'rgb(131,93,51)' }}
              className="font-bold text-center text-2xl py-6"
            >
              You have received following cats:
            </div>

            <div className="mt-1 sm:mt-0 sm:col-span-5">
              <div className="grid md:grid-cols-5 gap-y-10 md:justify-items-center">
                {blindBoxCats.map((cat, index) => {
                  return (
                    <div
                      key={index}
                      className="flex space-y-10 md:space-y-0 md:space-x-0 space-x-4 flex-row md:flex-col md:space-y-2 md:w-126"
                    >
                      <div
                        className="bg-white"
                        style={{
                          width: '126px',
                          height: '126px',
                          border: '2px solid rgb(153,153,153)',
                        }}
                      >
                        <img src={cat.image} />
                      </div>
                      <div style={{ color: 'rgb(131,93,51)' }} className="mt-2">
                        <div>{cat.id}</div>
                        <div>{cat.name}</div>
                        <div>{cat.rarity}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center mt-10">
                <div
                  className="btn-buy p-12 cursor-pointer font-medium text-2xl"
                  style={{ color: 'rgb(91,50,25)' }}
                  onClick={() => {
                    setShowSuccess(false)
                  }}
                >
                  Confirm
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Buy
