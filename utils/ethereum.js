import {ethers, Contract} from 'ethers';
import ROCBlindBox1 from '../contracts/build/contracts/ROCBlindBox1.json';
import CATECoin from '../contracts/build/contracts/CATECoin.json';
import ROCNFT from '../contracts/build/contracts/ROCNFT.json';
import IERC20Metadata from '../contracts/build/contracts/IERC20Metadata.json';
import ROCBlindBoxOxbullAirdropByAdd20211115 from '../contracts/build/contracts/ROCBlindBoxOxbullAirdropByAdd20211115.json';

// https://bsc-dataseed.binance.org/
// https://data-seed-prebsc-1-s1.binance.org:8545/
const LINK = process.env.NEXT_PUBLIC_LINK
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAINID


export const getBlockchain = ()=>
    new Promise(async (resolve, reject) => {
        // window.addEventListener('load', async ()=> {
            const provider = new ethers.providers.JsonRpcProvider(LINK);
            const network = await provider.getNetwork()
            // 请求的网络
            console.log(network)

            const rocBlindBox = new Contract(
                ROCBlindBox1.networks[CHAIN_ID].address,
                ROCBlindBox1.abi,
                provider
            );
            const cateCoin = new Contract(
                CATECoin.networks[CHAIN_ID].address,
                CATECoin.abi,
                provider
            );

            const rocNFT = new Contract(
                ROCNFT.networks[CHAIN_ID].address,
                ROCNFT.abi,
                provider
            );
            // 生产环境 将cateCoin.address 替换为真实地址
            resolve({provider, rocBlindBox, cateCoin: new Contract(cateCoin.address, IERC20Metadata.abi, provider), rocNFT});
            return;
        // })
    })

export const getSignBlockChain = (signer)=>
    new Promise(async (resolve, reject) => {

        const rocBlindBoxRW = new Contract(
            ROCBlindBox1.networks[CHAIN_ID].address,
            ROCBlindBox1.abi,
            signer
        );
        const cateCoinRW = new Contract(
            CATECoin.networks[CHAIN_ID].address,
            CATECoin.abi,
            signer
        );

        resolve({signer, rocBlindBoxRW, cateCoinRW});
    })


export const getCanClaimContractRW = (signer)=>
    new Promise(async (resolve, reject) => {

        const oxbullAirdrop20211115 = new Contract(
            ROCBlindBoxOxbullAirdropByAdd20211115.networks[CHAIN_ID].address,
            ROCBlindBoxOxbullAirdropByAdd20211115.abi,
            signer
        );

        resolve({signer, oxbullAirdrop20211115});
    })

// export const connectOrReloadAndConnect = async () => {
//     if (window.ethereum) {
//         try {
//             await ethereum.request({method: "eth_requestAccounts"});
//         } catch (error) {
//             console.log({ error })
//             // const message = error.message || "";
//
//             if (error.code === -32002) {
//                 alert('Please connect to MetaMask.');
//             } else {
//                 throw error;
//             }
//         }
//     } else {
//         alert('Please install metamask first.')
//     }
// }

// export async function getAccount() {
//     if (window.ethereum) {
//         const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//         const account = accounts[0];
//         return account
//     }
//     return null
// }
