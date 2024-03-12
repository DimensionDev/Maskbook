import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { createERC20Token } from '@masknet/web3-shared-evm'
import { Trader } from '@masknet/plugin-trader'
import { shareToTwitterAsPopup } from '@masknet/shared-base-ui'
import { useQuery } from '@tanstack/react-query'
import Services from '#services'

export function SwapBox() {
    const location = useLocation()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const params = new URLSearchParams(location.search)
    const address = params.get('contract_address')
    const name = params.get('name')
    const symbol = params.get('symbol')
    const decimals = params.get('decimals')
    const isTokenSecurityDisabled =
        useQuery({
            queryKey: ['Services.Settings.getPluginMinimalModeEnabledResolved(PluginID.GoPlusSecurity)'],
            queryFn: () => Services.Settings.getPluginMinimalModeEnabledResolved(PluginID.GoPlusSecurity),
            networkMode: 'always',
        }).data ?? true

    const fallbackToken = useMemo(() => {
        return createERC20Token(
            chainId,
            address ?? '',
            name ? name : undefined,
            symbol ? symbol : undefined,
            Number.parseInt(decimals ?? '0', 10),
        )
    }, [chainId, address, name, symbol, decimals])
    const { data: coin } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, address ?? '', fallbackToken, { chainId })

    return (
        <Trader
            isTokenSecurityEnabled={isTokenSecurityDisabled}
            share={shareToTwitterAsPopup}
            defaultInputCoin={coin}
            chainId={chainId}
        />
    )
}
