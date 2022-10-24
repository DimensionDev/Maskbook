import { useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChainContext } from '@masknet/web3-hooks-base'
import { PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import { createERC20Token, createNativeToken, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader.js'

export function SwapBox() {
    const location = useLocation()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const coin = useMemo(() => {
        if (!location.search) return undefined
        const params = new URLSearchParams(location.search)
        const address = params.get('contract_address')
        const name = params.get('name')
        const symbol = params.get('symbol')
        if (!address) return undefined
        return isNativeTokenAddress(address)
            ? createNativeToken(chainId)
            : createERC20Token(
                  chainId,
                  address,
                  name ? name : undefined,
                  symbol ? symbol : undefined,
                  Number.parseInt(params.get('decimals') ?? '0', 10),
              )
    }, [location, chainId])

    useUpdateEffect(() => {
        navigate(PopupRoutes.Swap, { replace: true })
    }, [chainId])

    return <Trader defaultInputCoin={coin} chainId={chainId} />
}
