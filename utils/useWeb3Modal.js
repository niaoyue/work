import {useEffect, useMemo, useState} from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
// import Web3 from "web3";
import {ethers} from "ethers";

const link = process.env.NEXT_PUBLIC_LINK
const chainId = process.env.NEXT_PUBLIC_CHAINID

export const useWeb3Modal = () => {
    const providerOptions = {
        walletconnect: {
            network: "binance",
            package: WalletConnectProvider, // required
            options: {
                rpc: {
                    [chainId]: link
                },
                chainId,
                network: "binance",
            }
        }

    };

    const [web3Modal, setWeb3Modal] = useState(null)
    const [connect, setConnect] = useState(null)
    const [provider, setProvider] = useState(null)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [balance, setBalance] = useState(null)
    const [ethBalance, setEthBalance] = useState('')
    const [humanFriendlyBalance, setHumanFriendlyBalance]  = useState('')

    useEffect(() => {
        const modal = new Web3Modal({
            cacheProvider: true, // optional
            providerOptions, // required
            disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
        })
        setWeb3Modal(modal)
    }, [])

    /**
     * Kick in the UI action after Web3modal dialog has chosen a provider
     */
    async function fetchAccountData(provider) {
        // // Get a Web3 instance for the wallet
        // const web3 = new Web3(provider);
        // console.log("Web3 instance is", web3);

        // Get connected chain id from Ethereum node
        // const chainId = await web3.eth.getChainId();
        // Load chain information over an HTTP API
        // const chainData = window.evmChains.getChain(chainId);
        // document.querySelector("#network-name").textContent = chainData.name;
        // Get list of accounts of the connected wallet

        try {
            const accounts = await provider.listAccounts();
        // MetaMask does not give you all accounts, only the selected account
            setSelectedAccount(accounts[0])

            if (accounts[0]) {
                const signer = provider.getSigner(accounts[0])
                const balance = await signer.getBalance();
                // const ethBalance = web3.utils.fromWei(balance, "ether");
                const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
                setBalance(balance)
                // setEthBalance(ethBalance)
                setHumanFriendlyBalance(humanFriendlyBalance)
            }
        } catch (e){
            console.log(e)
            setSelectedAccount(null)
        }
    }

    /**
     * Fetch account data for UI when
     * - User switches accounts in wallet
     * - User switches networks in wallet
     * - User connects wallet initially
     */
    async function refreshAccountData(provider) {

        // Disable button while UI is loading.
        // fetchAccountData() will take a while as it communicates
        // with Ethereum node via JSON-RPC and loads chain data
        // over an API call.
        // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
        await fetchAccountData(provider);
        // document.querySelector("#btn-connect").removeAttribute("disabled")
    }

    /**
     * Connect wallet button pressed.
     */
    async function onConnect() {
        // console.log("Opening a dialog", web3Modal);
        try {

            let conn
            if (!connect) {
                // localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
                // localStorage.removeItem('LoggedIn')
                conn = await web3Modal.connect();
                setConnect(conn)
            } else {
                conn = connect
            }

            let pro
            if (!provider) {
                pro = new ethers.providers.Web3Provider(conn, "any");
            } else {
                pro = provider
            }

            // const network = await provider.getNetwork()
            // console.log('---->network', network)
            setProvider(pro)
            localStorage.setItem('LoggedIn', 'true')

            conn.on("accountsChanged", async (accounts) => {
                // console.log('----->accountsChanged', accounts)
                if (accounts.length === 0) {
                    await onDisconnect()
                }
                await fetchAccountData(pro);
            });

            // connect.on("chainChanged", async (chainId) => {
            //     // console.log('----->chainChanged', chainId)
            //     const id = parseInt(chainId, 10)
            //     if (id !== 56 || id !== 97) {
            //         alert('Please choose bsc network chain before buying cats')
            //         return
            //     }
            //     await fetchAccountData(provider);
            // });

            // Subscribe to networkId change
            conn.on("networkChanged", async (networkId) => {
                console.log('----->networkChanged', networkId)
                await fetchAccountData(pro);
            });

            conn.on("disconnect", (error) => {
                console.log(error);
            });

            await refreshAccountData(pro);

            return { provider: pro, connect: conn }
        } catch(e) {
            console.log("Could not get a wallet connection", e);
            localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
            localStorage.removeItem('LoggedIn')
            return;
        }
    }

    /**
     * Disconnect wallet button pressed.
     */
    async function onDisconnect() {

        // console.log("Killing the wallet connection", connect);
        // TODO: Which providers have close method?
        if(connect && connect.close) {
            await connect.close();

            // If the cached provider is not cleared,
            // WalletConnect will default to the existing session
            // and does not allow to re-scan the QR code with a new wallet.
            // Depending on your use case you may want or want not his behavir.
            // await web3Modal.clearCachedProvider();
            // setConnect(null)
        }

        await web3Modal.clearCachedProvider();
        setConnect(null)
        setSelectedAccount(null)
        localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
        localStorage.removeItem('LoggedIn')
    }

    return {
        web3Modal,
        provider,
        selectedAccount,
        balance,
        ethBalance,
        humanFriendlyBalance,
        refreshAccountData,
        fetchAccountData,
        onConnect,
        onDisconnect
    }
}
