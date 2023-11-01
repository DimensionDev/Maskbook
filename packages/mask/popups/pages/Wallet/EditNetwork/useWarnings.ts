import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useNetworks } from '@masknet/web3-hooks-base'
import { fetchChains } from '@masknet/web3-providers/helpers'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'

export function useWarnings(formChainId: number, formSymbol?: string) {
    const t = useMaskSharedTrans()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const chainIdWarning = useMemo(() => {
        if (!formChainId) return
        const duplicated = networks.find((x) => x.chainId === formChainId)
        if (!duplicated?.isCustomized) return
        return t.chain_id_is_used_by({ name: duplicated.name })
    }, [formChainId, networks])
    const { data: chains = EMPTY_LIST } = useQuery(['chain-list'], fetchChains)

    const symbolWarning = useMemo(() => {
        const match = chains.find((chain) => chain.chainId === formChainId)
        if (!match) return
        if (match.nativeCurrency.symbol !== formSymbol)
            return t.rpc_return_different_symbol({ chain_id: String(formChainId), symbol: match.nativeCurrency.symbol })
        return undefined
    }, [chains, formSymbol, formChainId])

    return {
        chainIdWarning,
        symbolWarning,
    }
}
