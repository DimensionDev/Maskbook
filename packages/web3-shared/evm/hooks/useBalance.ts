import type { ChainId } from '../types'
import { useAccount, useChainId } from '..'
import { useWeb3 } from '.'
import { useAsyncRetry } from 'react-use'

export function useBalance(expectedChainId?: ChainId, expectedAccount?: string) {
    const defaultChainId = useChainId()
    const defaultAccount = useAccount()

    const chainId = expectedChainId ?? defaultChainId
    const account = expectedAccount ?? defaultAccount

    const web3 = useWeb3({ chainId })

    return useAsyncRetry(async () => web3.eth.getBalance(account), [web3, account])
}
