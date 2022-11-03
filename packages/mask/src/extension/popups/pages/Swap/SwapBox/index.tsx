import { useUpdateEffect } from 'react-use'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { createERC20Token, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader.js'

export function SwapBox() {
    const location = useLocation()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const params = new URLSearchParams(location.search)
    const address = params.get('contract_address')
    const name = params.get('name')
    const symbol = params.get('symbol')
    const decimals = params.get('decimals')
    const { value: coin } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        address ?? '',
        createERC20Token(
            chainId,
            address ?? '',
            name ? name : undefined,
            symbol ? symbol : undefined,
            Number.parseInt(decimals ?? '0', 10),
        ),
        { chainId },
    )

    useUpdateEffect(() => {
        navigate(PopupRoutes.Swap, { replace: true })
    }, [chainId])

    return (
        <Trader
            defaultInputCoin={coin as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>}
            chainId={chainId}
        />
    )
}
