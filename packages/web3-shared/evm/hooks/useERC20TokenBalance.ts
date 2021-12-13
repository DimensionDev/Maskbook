import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useChainId } from './useChainId'
import { useBlockNumber } from './useBlockNumber'
import type { ChainId } from '../types'
import { toHex } from 'web3-utils'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useERC20TokenBalance(address?: string, targetChainId?: ChainId) {
    const account = useAccount()
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const blockNumber = useBlockNumber()
    const erc20Contract = useERC20TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !address || !erc20Contract) return undefined
        return erc20Contract.methods.balanceOf(account).call({
            from: account,
            chainId: toHex(chainId),
        })
    }, [account, blockNumber, chainId, address, erc20Contract])
}
