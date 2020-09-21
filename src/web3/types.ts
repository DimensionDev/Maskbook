export enum ProviderType {
    Maskbook = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
}

export interface Token {
    type: EthereumTokenType
    chainId: ChainId
    address: string
    name: string
    symbol: string
    decimals: number
}

export enum ChainId {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Kovan = 42,
}

export enum EthereumTokenType {
    Ether = 0,
    ERC20 = 1,
    ERC721 = 2,
}
