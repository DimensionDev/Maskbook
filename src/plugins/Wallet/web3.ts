import Web3 from 'web3'
import { getNetworkSettings, currentEthereumNetworkSettings } from './network'

// export const web3 = new Web3(
//     new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
// )

export const web3 = new Web3()

let provider: any
let retries = 0

export const resetProvider = (e?: CloseEvent | Event) => {
    const isFatal = e instanceof CloseEvent || retries > 2
    if (e && !isFatal) retries += 1
    else {
        if (e) console.warn('resetting web3 websocket provider', e)
        provider = new Web3.providers.WebsocketProvider(getNetworkSettings().middlewareAddress)
        provider.on('end', resetProvider)
        provider.on('error', resetProvider)
        web3.setProvider(provider)
        retries = 0
    }
}
currentEthereumNetworkSettings.addListener(() => resetProvider())
resetProvider()

console.log(web3)

// export function switchToNetwork(x: EthereumNetwork) {
//     if (x === EthereumNetwork.Mainnet) {
//         web3.setProvider(
//             new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
//         )
//     } else if (x === EthereumNetwork.Rinkeby) {
//         web3.setProvider(
//             new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
//         )
//     }
// }
