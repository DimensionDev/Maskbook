import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'

export function useToken(chainId: ChainId | undefined, address: string | undefined) {
    const { data: tokens } = useOKXTokenList(chainId as ChainId)
    return useMemo(() => {
        if (!tokens || !chainId) return
        return tokens.find((x) => isSameAddress(x.address, address))
    }, [tokens, chainId])
}
