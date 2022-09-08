import { useValueRef } from '@masknet/shared-base-ui'
import type { TradeComputed } from '../../types'
import { createNativeToken, formatUSD, formatWeiToEther, GasOptionConfig } from '@masknet/web3-shared-evm'
import { useCallback, useMemo, useState } from 'react'
import { formatBalance, formatCurrency, FungibleToken, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { currentSlippageSettings } from '../../settings'
import { useNativeTokenPrice, useFungibleTokenPrice, Web3Helper } from '@masknet/plugin-infra/web3'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { PluginTraderMessages } from '../../messages'
import { ConfirmDialogUI } from './components/ConfirmDialogUI'
import { useSelectAdvancedSettings } from '@masknet/shared'
import { PriceImpactDialogUI } from './components/PriceImpactDialogUI'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import BigNumber from 'bignumber.js'
import { MIN_GAS_LIMIT } from '../../constants'

export interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    trade: TradeComputed
    inputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    outputToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    gas?: number
    gasPrice?: string
    gasConfig?: GasOptionConfig
    onConfirm: () => void
}
const PERCENT_DENOMINATOR = 10000

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { inputToken, outputToken, gas, gasPrice, trade, onConfirm, gasConfig } = props
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { setTemporarySlippage } = AllProviderTradeContext.useContainer()

    const [priceImpactDialogOpen, setPriceImpactDialogOpen] = useState(false)

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
    const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)
    // #endregion

    // #region price impact dialog
    const lostToken = formatBalance(
        multipliedBy(trade.inputAmount, trade.priceImpact).toFixed(),
        trade.inputToken?.decimals ?? 0,
    )

    const lostValue = formatCurrency(multipliedBy(inputTokenPrice ?? 0, lostToken), 'USD', {
        boundaries: {
            min: 0.01,
        },
    })

    const handleOpenPriceImpactDialog = useCallback(() => {
        setPriceImpactDialogOpen(true)
        props.onClose()
    }, [props.onClose])

    const handlePriceImpactDialogConfirm = useCallback(() => {
        if (!trade.priceImpact) return
        setTemporarySlippage(new BigNumber(trade?.priceImpact.multipliedBy(PERCENT_DENOMINATOR).toFixed(0)).toNumber())
        onConfirm()
        setPriceImpactDialogOpen(false)
    }, [trade])

    const onPriceImpactDialogClose = useCallback(() => {
        setPriceImpactDialogOpen(false)
    }, [])
    // #endregion

    return (
        <>
            <ConfirmDialogUI
                {...props}
                currentSlippage={currentSlippage}
                gasFee={gasFee}
                gasFeeUSD={gasFeeUSD}
                nativeToken={nativeToken}
                inputTokenPrice={inputTokenPrice}
                outputTokenPrice={outputTokenPrice}
                openSettingDialog={async () => {
                    const { slippageTolerance, transaction } = await selectAdvancedSettings({
                        chainId,
                        disableGasLimit: true,
                        disableSlippageTolerance: false,
                        slippageTolerance: currentSlippageSettings.value / 100,
                        transaction: {
                            gas: gas ?? MIN_GAS_LIMIT,
                            ...(gasConfig ?? {}),
                        },
                    })

                    if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

                    PluginTraderMessages.swapSettingsUpdated.sendToAll({
                        open: false,
                        gasConfig: {
                            gasPrice: transaction?.gasPrice as string | undefined,
                            maxFeePerGas: transaction?.maxFeePerGas as string | undefined,
                            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas as string | undefined,
                        },
                    })
                }}
                isGreatThanSlippageSetting={isGreatThanSlippageSetting}
                onConfirm={isGreatThanSlippageSetting ? handleOpenPriceImpactDialog : onConfirm}
            />
            <PriceImpactDialogUI
                open={priceImpactDialogOpen}
                onClose={onPriceImpactDialogClose}
                onConfirm={handlePriceImpactDialogConfirm}
                lostToken={lostToken}
                symbol={inputToken.symbol}
                lostValue={lostValue}
                priceImpact={trade.priceImpact}
            />
        </>
    )
}
