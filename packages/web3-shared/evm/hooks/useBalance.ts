import { useWeb3StateContext } from '../context'
import type { ChainId } from '../types'
import { useAccount, useChainId } from '..'

export function useBalance(chainId?: ChainId, account?: string) {
    const defaultChainId = useChainId()
    const defaultAccount = useAccount()
    const { balanceOfChain } = useWeb3StateContext()
    return balanceOfChain[chainId ?? defaultChainId]?.[account ?? defaultAccount] ?? '0'
}
