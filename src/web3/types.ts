export interface ERC20Token {
    name: string
    symbol: string
    decimals: number
    address: string
}

export enum EthereumNetwork {
    Mainnet = 'Mainnet',
    Rinkeby = 'Rinkeby',
    Ropsten = 'Ropsten',
}

export enum EthereumTokenType {
    ETH = 0,
    ERC20 = 1,
    ERC721 = 2,
}
