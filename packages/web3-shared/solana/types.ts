export enum ChainId {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
}

export enum NetworkType {
    Solana = 'Solana',
}

export enum ProviderType {
    Phantom = 'Phantom',
    Sollet = 'Sollet',
}

export interface SolanaTokenDetaild {
    address: string
    chainId: ChainId
    name?: string
    symbol?: string
    decimals: number
    logoURI?: string[]
}
