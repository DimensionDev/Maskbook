export enum ProviderType {
    Maskbook = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
}

export interface ERC20Token {
    chainId?: ChainId
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
    ETH = 0,
    ERC20 = 1,
    ERC721 = 2,
}
