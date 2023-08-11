import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useNetworks } from '@masknet/web3-hooks-base'
import { fetchChains } from '@masknet/web3-providers/helpers'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useI18N } from '../../../../../utils/index.js'

export function useWarnings(formChainId: number, formSymbol?: string) {
    const { t } = useI18N()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const chainIdWarning = useMemo(() => {
        if (!formChainId) return
        const duplicated = networks.find((x) => x.chainId === formChainId)
        if (!duplicated) return
        return t('chain_id_is_used_by', { name: duplicated.name })
    }, [formChainId, networks])
    const { data: chains = EMPTY_LIST } = useQuery(['chain-list'], fetchChains)

    const symbolWarning = useMemo(() => {
        const match = chains.find((chain) => chain.chainId === formChainId)
        if (!match) return
        if (match.nativeCurrency.symbol !== formSymbol)
            return t('rpc_return_different_symbol', { chain_id: formChainId, symbol: match.nativeCurrency.symbol })
    }, [chains, formSymbol, formChainId])

    return {
        chainIdWarning,
        symbolWarning,
    }
}
