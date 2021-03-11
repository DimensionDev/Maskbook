import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useChainId } from './useChainState'
import Services from '../../extension/service'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useEtherTokenBalance(address: string) {
    const account = useAccount()
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        console.log({
            account,
            address,
        })
        if (!account || !address) return
        return Services.Ethereum.getBalance(account, chainId)
    }, [account, chainId /* re-calc when switch the chain */, address])
}
