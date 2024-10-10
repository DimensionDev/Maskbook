import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useNetworks } from '@masknet/web3-hooks-base'
import { fetchChains } from '@masknet/web3-providers/helpers'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export function useWarnings(formChainId: number, formSymbol?: string) {
    const { _ } = useLingui()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const chainIdWarning = useMemo(() => {
        if (!formChainId) return
        const duplicated = networks.find((x) => x.chainId === formChainId)
        if (!duplicated?.isCustomized) return
        return _(msg`This Chain ID is currently used by the ${duplicated.name} network. `)
    }, [formChainId, networks])
    const { data: chains = EMPTY_LIST } = useQuery({ queryKey: ['chain-list'], queryFn: fetchChains })

    const symbolWarning = useMemo(() => {
        const match = chains.find((chain) => chain.chainId === formChainId)
        if (!match) return
        if (match.nativeCurrency.symbol !== formSymbol)
            return _(
                msg`The network with chain ID ${formChainId} may use a different currency symbol (${match.nativeCurrency.symbol}) than the one you have entered. Please check.`,
            )
        return undefined
    }, [chains, formSymbol, formChainId])

    return {
        chainIdWarning,
        symbolWarning,
    }
}
