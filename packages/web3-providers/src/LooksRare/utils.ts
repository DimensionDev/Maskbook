import { ChainId } from '@masknet/web3-shared-evm'

export function isSupportedChainId(chainId?: ChainId) {
    return chainId === ChainId.Mainnet
}
