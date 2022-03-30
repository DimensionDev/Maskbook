import { toHex } from 'web3-utils'
import { useBeatRetry } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

/**
 * Fetch token balance from chain
 * @param address
 * @param targetChainId
 */
export function useERC20TokenBalance(address?: string, targetChainId?: ChainId): AsyncStateRetry<string | undefined> {
    const account = useAccount()
    const defaultChainId = useChainId()
    const chainId = targetChainId ?? defaultChainId
    const erc20Contract = useERC20TokenContract(address)
    return useBeatRetry(
        async () => {
            if (!account || !address || !erc20Contract) return undefined
            return erc20Contract.methods.balanceOf(account).call({
                from: account,
                chainId: toHex(chainId),
            })
        },
        30 * 1000,
        [account, chainId, address, erc20Contract],
    )
}
