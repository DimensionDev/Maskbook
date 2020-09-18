export interface ERC20Token {
    address: string
    name: string
    symbol: string
    decimals: number
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
