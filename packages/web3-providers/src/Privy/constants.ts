import { ChainId } from '@masknet/web3-shared-evm'

export const PRIVY_API_HOST = 'https://api.privy.io/api'
export const PRIVY_AUTH_HOST = 'https://auth.privy.io/api'

/** Supported by both privy and mask */
export const PRIVY_SUPPORTED_CHAINS = [
    ChainId.Mainnet,
    ChainId.Base,
    ChainId.BSC,
    ChainId.Optimism,
    ChainId.Polygon,
    ChainId.Arbitrum,
    ChainId.Celo,
]
