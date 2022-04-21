import type { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'

export function resolveGoLabLink(chainId: ChainId, address: string) {
    return urlcat('https://gopluslabs.io/token-security/:chainId/:address', { chainId, address })
}
