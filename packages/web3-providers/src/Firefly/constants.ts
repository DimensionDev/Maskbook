import { ChainId } from '@masknet/web3-shared-evm'

export const FIREFLY_BASE_URL = 'https://api.firefly.land'
export const FIREFLY_SITE_URL = 'https://firefly.social'

/**
 * Chains supported by the Firefly embedded wallet. Kept under the historical
 * name so existing call sites are unchanged after the Privy removal.
 */
export const PRIVY_SUPPORTED_CHAINS = [
    ChainId.Mainnet,
    ChainId.Base,
    ChainId.BSC,
    ChainId.Optimism,
    ChainId.Polygon,
    ChainId.Arbitrum,
    ChainId.Celo,
]

export const EMAIL_REGEX =
    /(([^\s"(),./:;<>@[\\\]]+(\.[^\s"(),./:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}\])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/u

export const URL_REGEX = /((https?:\/\/)?[\da-z]+([.-][\da-z]+)*\.[a-z]{2,}(:\d{1,5})?(\/[^\n ),>]*)?)/giu
