import Web3 from 'web3'

// export const web3 = new Web3(
//     new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
// )
export const web3 = new Web3(
    new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5'),
)
