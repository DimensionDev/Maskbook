import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useChainId } from './useChainId'
import { useBlockNumber } from './useBlockNumber'
import { useWeb3 } from './useWeb3'

/**
 * Fetch native token balance from chain
 * @param address
 */
export function useNativeTokenBalance(address: string) {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber()
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return web3.eth.getBalance(account)
    }, [web3, account, blockNumber, chainId, address])
}
