import { useAsync } from 'react-use'
import { useContainer } from 'unstated-next'
import { DepositPaymaster } from '@masknet/web3-providers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { PopupContext } from './usePopupContext.js'

export function useGasRatio(paymentToken?: string) {
    const { smartPayChainId } = useContainer(PopupContext)

    const { value: smartPayRatio } = useAsync(async () => {
        if (!smartPayChainId) return
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        const ratio = await depositPaymaster.getRatio()

        return ratio
    }, [smartPayChainId])

    return paymentToken && !isNativeTokenAddress(paymentToken) ? smartPayRatio : undefined
}
