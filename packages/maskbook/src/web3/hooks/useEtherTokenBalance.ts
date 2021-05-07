import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useBlockNumber, useChainId } from './useBlockNumber'
import Services from '../../extension/service'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useEtherTokenBalance(address: string) {
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return Services.Ethereum.getBalance(account)
    }, [account, blockNumber, chainId, address])
}
