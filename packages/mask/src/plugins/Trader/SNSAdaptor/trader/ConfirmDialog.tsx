import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import type { TradeComputed } from '../../types'
import { createNativeToken, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { FungibleToken, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { currentSlippageSettings } from '../../settings'
import { useNativeTokenPrice, useFungibleTokenPrice, Web3Helper } from '@masknet/plugin-infra/web3'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { PluginTraderMessages } from '../../messages'
import { ConfirmDialogUI } from './components/ConfirmDialogUI'

export interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    trade: TradeComputed
    inputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    outputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    gas?: number
    gasPrice?: string
    onConfirm: () => void
    openPriceImpact: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { inputToken, outputToken, gas, gasPrice, trade, openPriceImpact, onConfirm } = props
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()

    const currentSlippage = useValueRef(currentSlippageSettings)
    const nativeToken = createNativeToken(chainId)
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { value: inputTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, inputToken.address)
    const { value: outputTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, outputToken.address)

    const gasFee = useMemo(() => {
        return gas && gasPrice ? multipliedBy(gasPrice, gas).integerValue().toFixed() : '0'
    }, [gas, gasPrice])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(nativeTokenPrice))
    }, [gasFee, nativeTokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade?.priceImpact)

    // #region remote controlled swap settings dialog
    const { openDialog: openSwapSettingDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    // #endregion

    return (
        <ConfirmDialogUI
            {...props}
            currentSlippage={currentSlippage}
            gasFee={gasFee}
            gasFeeUSD={gasFeeUSD}
            nativeToken={nativeToken}
            inputTokenPrice={inputTokenPrice}
            outputTokenPrice={outputTokenPrice}
            openSettingDialog={openSwapSettingDialog}
            isGreatThanSlippageSetting={isGreatThanSlippageSetting}
            onConfirm={isGreatThanSlippageSetting ? openPriceImpact : onConfirm}
        />
    )
}
