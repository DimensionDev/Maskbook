export enum ProviderType {
    Maskbook = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
}

export enum CurrencyType {
    USD = 'usd',
}

export interface Token {
    type: SolanaTokenType
    chainId: ChainId
    address: string
    name: string
    symbol: string
    decimals: number
}

export interface ERC20Token extends Token {
    type: SolanaTokenType.ERC20
    decimals: number
}

export interface ERC721Token extends Token {
    type: SolanaTokenType.ERC721
    baseURI: string
}

export interface TokenDetailed {
    token: Token
    /**
     * The total balance of token
     */
    balance: string
    /**
     * The estimated price
     */
    price?: {
        [key in CurrencyType]: string
    }
    /**
     * The estimated value
     */
    value?: {
        [key in CurrencyType]: string
    }
    logoURL?: string
}

// A list of chain IDs https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Mainnet = 1,
    Devnet = 2,
    Testnet = 3,
}

export enum SolanaNetwork {
    Mainnet = 'Mainnet',
    Devnet = 'Devnet',
    Testnet = 'Testnet',
}

export enum SolanaTokenType {
    Sol = 0,
    ERC20 = 1,
    ERC721 = 2,
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}
