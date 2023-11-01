import { DepositPaymaster } from '@masknet/web3-providers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useContainer } from 'unstated-next'
import { PopupContext } from './usePopupContext.js'

export function useGasRatio(paymentToken?: string) {
    const { smartPayChainId } = useContainer(PopupContext)

    const { data: smartPayRatio } = useQuery(['smart-pay', 'gas-ratio', smartPayChainId], async () => {
        if (!smartPayChainId) return
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        const ratio = await depositPaymaster.getRatio()
        return ratio
    })

    return paymentToken && !isNativeTokenAddress(paymentToken) ? smartPayRatio : undefined
}
