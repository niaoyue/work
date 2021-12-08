import '../styles/global.css'
import { Web3ReactProvider } from '@web3-react/core'
import { Helmet } from 'react-helmet'

// function getLibrary(provider, connector) {
//   return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
// }

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Rise of Cats - Origin Cats NFT</title>
      </Helmet>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
