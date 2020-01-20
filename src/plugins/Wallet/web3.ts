import Web3 from 'web3'
import { EthereumNetwork } from '../../database/Plugins/Wallet/types'

// export const web3 = new Web3(
//     new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
// )

export const web3 = new Web3()

let provider: any
let retrys = 0

const resetProvider = (e?: CloseEvent | Event) => {
    const isFatal = e instanceof CloseEvent || retrys > 2
    if (e && !isFatal) retrys += 1
    else {
        if (e) console.warn('resetting web3 websocket provider', e)
        provider = new Web3.providers.WebsocketProvider(
            'wss://rinkeby.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
        )
        provider.on('end', resetProvider)
        provider.on('error', resetProvider)
        web3.setProvider(provider)
        retrys = 0
    }
}
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
