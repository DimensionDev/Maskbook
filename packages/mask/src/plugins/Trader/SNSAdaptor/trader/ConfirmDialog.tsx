import { useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { formatWeiToEther, type ChainId, type GasConfig, GasEditor, type Transaction } from '@masknet/web3-shared-evm'
import { formatBalance, formatCurrency, leftShift, multipliedBy } from '@masknet/web3-shared-base'
import type { TradeComputed } from '../../types/index.js'
import {
    useNativeTokenPrice,
    useFungibleTokenPrice,
    useChainContext,
    useWeb3Others,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSelectAdvancedSettings } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting.js'
import { currentSlippageSettings } from '../../settings.js'
import { PluginTraderMessages } from '../../messages.js'
import { ConfirmDialogUI } from './components/ConfirmDialogUI.js'
import { PriceImpactDialogUI } from './components/PriceImpactDialogUI.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'

export interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    trade: TradeComputed
    inputToken: Web3Helper.FungibleTokenAll
    outputToken: Web3Helper.FungibleTokenAll
    gas?: string
    gasPrice?: string
    gasConfig?: GasConfig
    onConfirm: () => void
}
const PERCENT_DENOMINATOR = 10000

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { inputToken, outputToken, gas = MIN_GAS_LIMIT, gasPrice, trade, onConfirm, gasConfig } = props
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()
    const { setTemporarySlippage } = AllProviderTradeContext.useContainer()

    const [priceImpactDialogOpen, setPriceImpactDialogOpen] = useState(false)

    const currentSlippage = useValueRef(currentSlippageSettings)
    const nativeToken = Others.createNativeToken(chainId)
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(pluginID)

    const { value: inputTokenPrice = 0 } = useFungibleTokenPrice(pluginID, inputToken.address)
    const { value: outputTokenPrice = 0 } = useFungibleTokenPrice(pluginID, outputToken.address)

    const gasFee = useMemo(() => {
        return gas && gasPrice ? multipliedBy(gasPrice, gas).integerValue().toFixed() : '0'
    }, [gas, gasPrice])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatCurrency(formatWeiToEther(gasFee).times(nativeTokenPrice), 'USD', { onlyRemainTwoDecimal: true })
    }, [gasFee, nativeTokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade?.priceImpact)

    // #region remote controlled swap settings dialog
    const selectAdvancedSettings = useSelectAdvancedSettings()
    // #endregion

    const lostTokenValue = multipliedBy(trade.inputAmount, trade.priceImpact).toFixed(0)
    // #region price impact dialog
    const lostToken = formatBalance(lostTokenValue, trade.inputToken?.decimals ?? 0, 6)

    const lostValue = formatCurrency(
        multipliedBy(inputTokenPrice ?? 0, leftShift(lostTokenValue, trade.inputToken?.decimals ?? 0)),
        '',
        { onlyRemainTwoDecimal: true },
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

    const [, openSettingDialog] = useAsyncFn(async () => {
        const { slippageTolerance, transaction } = await selectAdvancedSettings({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: false,
            slippageTolerance: currentSlippageSettings.value / 100,
            transaction: {
                gas,
                ...gasConfig,
            },
        })

        if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

        PluginTraderMessages.swapSettingsUpdated.sendToAll({
            open: false,
            gasConfig: GasEditor.fromTransaction(chainId as ChainId, transaction as Transaction).getGasConfig(),
        })
    }, [chainId, currentSlippageSettings.value, gas, gasConfig])

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
                openSettingDialog={pluginID === NetworkPluginID.PLUGIN_EVM ? openSettingDialog : undefined}
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
