import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useValueRef } from '@masknet/shared-base-ui'
import type { TradeComputed } from '../../types/index.js'
import { createNativeToken, formatUSD, formatWeiToEther, GasOptionConfig } from '@masknet/web3-shared-evm'
import { formatBalance, formatCurrency, leftShift, multipliedBy } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { currentSlippageSettings } from '../../settings.js'
import { useNativeTokenPrice, useFungibleTokenPrice, useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting.js'
import { PluginTraderMessages } from '../../messages.js'
import { ConfirmDialogUI } from './components/ConfirmDialogUI.js'
import { useSelectAdvancedSettings } from '@masknet/shared'
import { PriceImpactDialogUI } from './components/PriceImpactDialogUI.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'

export interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    trade: TradeComputed
    inputToken: Web3Helper.FungibleTokenAll
    outputToken: Web3Helper.FungibleTokenAll
    gas?: number
    gasPrice?: string
    gasConfig?: GasOptionConfig
    onConfirm: () => void
}
const PERCENT_DENOMINATOR = 10000

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { inputToken, outputToken, gas, gasPrice, trade, onConfirm, gasConfig } = props
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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

    const lostTokenValue = multipliedBy(trade.inputAmount, trade.priceImpact).toFixed(0)
    // #region price impact dialog
    const lostToken = formatBalance(lostTokenValue, trade.inputToken?.decimals ?? 0, 6)

    const lostValue = formatCurrency(
        multipliedBy(inputTokenPrice ?? 0, leftShift(lostTokenValue, trade.inputToken?.decimals ?? 0)),
        'USD',
        {
            boundaries: {
                min: 0.01,
            },
            symbols: {
                // hide USD symbol
                $: '',
            },
        },
    )

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
