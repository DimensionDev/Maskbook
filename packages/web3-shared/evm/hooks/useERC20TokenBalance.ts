import { toHex } from 'web3-utils'
import { DOUBLE_BLOCK_DELAY, useBeatRetry } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

/**
 * Fetch token balance from chain
 * @param address
 * @param targetChainId
 */
export function useERC20TokenBalance(address?: string, targetChainId?: ChainId) {
    const account = useAccount()
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const erc20Contract = useERC20TokenContract(address)
    return useBeatRetry(
        async () => {
            if (!account || !address || !erc20Contract) return undefined
            return erc20Contract.methods.balanceOf(account).call({
                from: account,
                chainId: toHex(chainId),
            })
        },
        DOUBLE_BLOCK_DELAY,
        [account, chainId, address, erc20Contract],
    )
}
