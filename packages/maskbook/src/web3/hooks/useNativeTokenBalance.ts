import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useChainId } from './useChainId'
import Services from '../../extension/service'

/**
 * Fetch native token balance from chain
 * @param address
 */
export function useNativeTokenBalance(address: string) {
    const account = useAccount()
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return Services.Ethereum.getBalance(account)
    }, [account, chainId, address])
}
