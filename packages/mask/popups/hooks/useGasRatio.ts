import { DepositPaymaster } from '@masknet/web3-providers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useContainer } from '@masknet/shared-base-ui'
import { PopupContext } from './usePopupContext.js'
import { useDebugValue } from 'react'

export function useGasRatio(paymentToken?: string) {
    const { smartPayChainId } = useContainer(PopupContext)

    const { data: smartPayRatio } = useQuery({
        queryKey: ['smart-pay', 'gas-ratio', smartPayChainId],
        queryFn: async () => {
            if (!smartPayChainId) return
            const depositPaymaster = new DepositPaymaster(smartPayChainId)
            const ratio = await depositPaymaster.getRatio()
            return ratio
        },
    })

    const value = paymentToken && !isNativeTokenAddress(paymentToken) ? smartPayRatio : undefined
    useDebugValue(value)
    return value
}
