import {useWeb3Modal} from "../utils/useWeb3Modal";
import {useEffect, useRef, useState} from "react";
import {getBlockchain, getSignBlockChain, getCanClaimContractRW} from "../utils/ethereum";
import Alert from "../components/Alert";
import axios from "axios";
import Loader from "react-loader-spinner";
import {BigNumber} from "ethers";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAINID

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Profile = () => {
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
  const providerRef = useRef()
  providerRef.current = provider

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  const [hasClaimed, setHasClaimed] = useState(true)
  const [isRightChain, setIsRightChain] = useState(false)
  const isRightChainRef = useRef()
  isRightChainRef.current = isRightChain
  const [showSuccess, setShowSuccess] = useState(false)
  const [canClaimContracts, setCanClaimContracts] = useState(null)
  const canClaimContractsRef = useRef()
  canClaimContractsRef.current = canClaimContracts

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

  const updateCanClaimContracts = async () => {
    if(providerRef.current == null || isRightChainRef.current == false) {
      canClaimContractsRef.current = null
      setCanClaimContracts(canClaimContractsRef.current)
      return
    }
    var ret = await getCanClaimContractRW(providerRef.current.getSigner())
    canClaimContractsRef.current = ret
    setCanClaimContracts(canClaimContractsRef.current)
  }

  const fetchClaimed = async () => {
    setHasClaimed(true)
    if(canClaimContractsRef.current == null || selectedAccountRef.current == null) {
      return
    }

    const {oxbullAirdrop20211115} = canClaimContractsRef.current
    let canClaim = await oxbullAirdrop20211115.canClaim(selectedAccountRef.current)
    console.log('canClaim: ', canClaim)
    setHasClaimed(!canClaim)
  }

  const fetchCats = async () => {
    console.log('------->获取数据')
    setLoading(true)
    console.log(selectedAccountRef.current)
    try {
      if(selectedAccountRef.current != null) {
        // 盲盒商品信息tokenIds
        const resp = await axios.get(
            `https://play.catecoin.club/api/web/profile?address=${selectedAccountRef.current}`
        )

        console.log(resp.data)
        if (Array.isArray(resp.data)) {
          setList(resp.data)
        } else {
          setList([])
        }
      } else {
        setList([])
      }
    } catch (e) {
      console.log(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      const { provider, connect } = await onConnect()
      providerRef.current = provider
      // console.log(provider)
      // Subscribe to chainId change
      connect.on("chainChanged", async (chainId) => {
        console.log('----->chainChanged', chainId)
        const idBn = BigNumber.from(chainId)
        console.log("new chain Id: ", idBn.toString(), ", equals: ", idBn.toString() === CHAIN_ID)
        if (idBn.toString() !== CHAIN_ID) {
          setIsRightChain(false)
          setShowAlert(true)
          setAlertMsg('Please choose bsc network chain before buying cats')
          return
        }
        setIsRightChain(true)
        await fetchAccountData(provider);
      });
      setIsRightChain(false)
      const network = await provider.getNetwork()
      console.log("network: ", network.chainId, ", equal: ", network.chainId == CHAIN_ID)
      isRightChainRef.current = (network.chainId == CHAIN_ID);
      setIsRightChain(isRightChainRef.current)

      updateCanClaimContracts()
      fetchCats();
    } catch (e) {
      console.log(e)
      if (typeof e === 'string') {
        setShowAlert(true)
        setAlertMsg(e)
      }
      setHasClaimed(true)
    }
  }

  // 获取可以claim的合约
  useEffect(()  => {
    if(selectedAccount == null) {
      isRightChainRef.current = false
      setIsRightChain(isRightChainRef.current)
    }
    fetchCats()
    updateCanClaimContracts()
  }, [selectedAccount])

  // 获取可以claim的合约
  useEffect(()  => {
    fetchClaimed()
  }, [canClaimContracts])

  const handleLogout = async () => {
    await onDisconnect()
  }

  const handleCloseAlert = () => {
    setShowAlert(false)
    setAlertMsg('')
  }

  const [isClaiming, setIsClaiming] = useState(false)
  const [blindBoxCats, setBlindBoxCats] = useState([])
  const handleClaim = async () => {
    if(isClaiming) {
      return
    }
    if(canClaimContractsRef.current == null || selectedAccountRef.current == null) {
      return
    }
    setIsClaiming(true)
    try {
      const {oxbullAirdrop20211115} = canClaimContractsRef.current
      const txClaim = await oxbullAirdrop20211115.claim()
      let receipt = await txClaim.wait()
      console.log(receipt)
      let tokenIds = []
      for(let i = 0; i < receipt.events.length; i++) {
        let ev = receipt.events[i]
        if(ev.event && ev.event == 'BlindBoxOpened') {
          tokenIds = tokenIds.concat(ev.args.tokenIds)
        }
      }

      const strTokenIds = tokenIds.map((id) => id.toString()).join(',')

      // 盲盒商品信息tokenIds
      const metaDataAryResp = await axios.get(
        `https://nft.riseofcats.com/cats/${strTokenIds}`
      )
      // 盲盒数据
      // console.log(metaDataAryResp)
      setBlindBoxCats(metaDataAryResp.data)

      setShowSuccess(true)
    } catch (e) {
      console.log(e)
      setShowAlert(true)
      setAlertMsg(e.data && e.data.message || e.message)
    } finally {
      setIsClaiming(false)
      updateCanClaimContracts()
      fetchCats()
    }

  }

  const borderColors = [
      'rgb(153,153,153)',
      'rgb(150,210,116)',
      'rgb(104,175,246)',
      'rgb(241,159,202)',
      'rgb(171,121,198)',
      'rgb(153,153,153)',
      'rgb(150,210,116)',
  ]

  return (
    <div style={{ backgroundColor: 'rgb(205,205,205)' }}>
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
      <div
        className="max-w-280 min-h-screen mx-auto shadow-2xl"
        style={{ backgroundColor: 'rgb(248,242,228)' }}
      >
        <div className="flex justify-end items-center py-5 px-5">
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
                <div className="text-red-600 font-medium leading-none text-xs mr-2 hover:underline">
                  {selectedAccount.slice(0, 6) +
                  '...' +
                  selectedAccount.slice(-4)}
                </div>
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
                Claim success
              </div>

              <div
                  style={{ color: 'rgb(131,93,51)' }}
                  className="text-center text-2xl pb-5"
              >
                Your claim is successfully completed!
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
                      className="btn-buy px-12 py-6 cursor-pointer font-medium text-2xl"
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

        <div
          className="py-10 px-14"
          style={{ backgroundColor: 'rgb(248,242,228)' }}
        >
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{ color: 'rgb(94,61,30)' }}
          >
            Profile
          </h1>

          <div className="sm:grid sm:grid-cols-6 sm:gap-1 sm:items-center mt-5">
            <label
              htmlFor="about"
              className="block text-md md:text-lg font-bold"
              style={{ color: 'rgb(138,124,106)' }}
            >
              Wallet address
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-5">
              <div style={{ color: 'rgb(131, 93, 51)' }}>{selectedAccount}</div>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-6 sm:gap-1 sm:items-start mt-10">
            <label
              htmlFor="about"
              className="block text-md md:text-lg font-bold self:items-start"
              style={{ color: 'rgb(138,124,106)' }}
            >
              Assets
            </label>
            { !hasClaimed && <div
                className={classNames(
                    'btn-buy flex justify-center items-center font-medium text-xl lg:text-2xl px-12' +
                    ' py-5 transform cursor-pointer mt-4 sm:mt-0 sm:col-span-3 lg:col-span-2',
                )}
                style={{ color: 'rgb(91,50,25)' }}
                onClick={handleClaim}
            >

              {isClaiming && (
                    <>
                      <Loader />
                      <span className="ml-1">Pending </span>
                    </>
                )}

              {!isClaiming && <span>Claim</span>}
            </div>}
            {loading && <Loader
                type="ThreeDots"
                color="#8a7c6a"
                height={100}
                width={100}
                timeout={3000} //3 secs
            /> }
            { !loading && <div className="mt-1 sm:mt-0 sm:col-span-5 -mr-12">
              <div
                className="sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-y-10 sm:items-center"
                style={{ color: 'rgb(131, 93, 51)' }}
              >
                { list.map((item, index) => <div key={index} className="flex space-x-4 sm:space-x-0 sm:block my-10 sm:my-0">
                  <img src={item.image}
                    className="bg-white"
                    style={{
                      width: '126px',
                      height: '126px',
                      border: `2px solid ${borderColors[index % 7]}`,
                    }}
                  ></img>
                    <div className="mt-2 w-126 text-sm md:text-md">
                    <div>#{item.id}</div>
                    <div>{item.name}</div>
                    <div>{item.rarity}</div>
                    </div>
                </div>)}
              </div>
            </div> }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
