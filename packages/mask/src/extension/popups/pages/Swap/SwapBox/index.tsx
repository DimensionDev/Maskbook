import { useChainId } from '@masknet/plugin-infra/web3'
import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUpdateEffect } from 'react-use'
// import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
// import type { Coin } from '../../../../../plugins/Trader/types'
import { PopupRoutes } from '@masknet/shared-base'

export function SwapBox() {
    return null
    // const location = useLocation()
    // const navigate = useNavigate()
    // const chainId = useChainId()

    // const coin = useMemo(() => {
    //     if (!location.search) return undefined
    //     const params = new URLSearchParams(location.search)
    //     return {
    //         id: params.get('id'),
    //         name: params.get('name'),
    //         symbol: params.get('symbol'),
    //         contract_address: params.get('contract_address'),
    //         decimals: Number.parseInt(params.get('decimals') ?? '0', 10),
    //     } as Coin
    // }, [location])

    // useUpdateEffect(() => {
    //     navigate(PopupRoutes.Swap, { replace: true })
    // }, [chainId])

    // return <Trader coin={coin} chainId={chainId} />
}
