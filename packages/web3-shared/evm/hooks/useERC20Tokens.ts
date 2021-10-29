import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { useWeb3State } from '../context'
import { useChainId } from './useChainId'

export function useERC20Tokens() {
    const chainId = useChainId()
    const wallet = useWallet()
    const erc20Tokens = useWeb3State().erc20Tokens

    return useMemo(() => {
        if (!wallet) return []
        return erc20Tokens.filter((x) => x.chainId === chainId)
    }, [chainId, wallet, erc20Tokens])
}
