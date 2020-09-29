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

// A list of chain IDs https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Kovan = 42,
}

// Please don't use this enum but use ChainId instead
// this exists for back backward compatible
export enum EthereumNetwork {
    Mainnet = 'Mainnet',
    Ropsten = 'Ropsten',
    Rinkeby = 'Rinkeby',
    Kovan = 'Kovan',
}

export enum EthereumTokenType {
    Ether = 0,
    ERC20 = 1,
    ERC721 = 2,
}
