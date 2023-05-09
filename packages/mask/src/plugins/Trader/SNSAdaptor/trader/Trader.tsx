import { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useMemo } from 'react'
import { useAsync, useUnmount, useUpdateEffect } from 'react-use'
import { delay } from '@masknet/kit'
import { useOpenShareTxDialog, useSelectFungibleToken } from '@masknet/shared'
import { formatBalance, isSameAddress, isZero, minus, toFixed } from '@masknet/web3-shared-base'
import {
    addGasMargin,
    ChainId,
    DepositPaymaster,
    type EIP1559GasConfig,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    useChainContext,
    useChainIdValid,
    useFungibleTokenBalance,
    useMaskTokenAddress,
    useNetworkContext,
    useWallet,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base.js'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base.js'
import { useI18N } from '../../locales/index.js'
import { isNativeTokenWrapper } from '../../helpers/index.js'
import { PluginTraderMessages } from '../../messages.js'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { useTradeCallback } from '../../trader/useTradeCallback.js'
import { TokenPanelType, type TradeInfo } from '../../types/index.js'
import { ConfirmDialog } from './ConfirmDialog.js'
import { useSortedTrades } from './hooks/useSortedTrades.js'
import { useUpdateBalance } from './hooks/useUpdateBalance.js'
import { TradeForm } from './TradeForm.js'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TraderStateBar } from './TraderStateBar.js'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useMountReport, useTelemetry } from '@masknet/web3-telemetry/hooks'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { SmartPayBundler } from '@masknet/web3-providers'
import { BigNumber } from 'bignumber.js'

export interface TraderProps extends withClasses<'root'> {
    defaultInputCoin?: Web3Helper.FungibleTokenAll
    defaultOutputCoin?: Web3Helper.FungibleTokenAll
    chainId?: Web3Helper.ChainIdAll
    settings?: boolean
}

export interface TraderRef {
    gasConfig?: GasConfig
    focusedTrade?: TradeInfo
    refresh: () => void
}

export const Trader = forwardRef<TraderRef, TraderProps>((props: TraderProps, ref) => {
    const telemetry = useTelemetry()
    const wallet = useWallet()
    const { defaultOutputCoin, chainId: targetChainId, defaultInputCoin, settings = false } = props
    const t = useI18N()
    const [focusedTrade, setFocusTrade] = useState<TradeInfo>()
    const { chainId, account, setChainId } = useChainContext({
        chainId: targetChainId,
    })

    const { pluginID } = useNetworkContext()
    const traderDefinition = useActivatedPlugin(PluginID.Trader, 'any')
    const chainIdList = traderDefinition?.enableRequirement?.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
    const chainIdValid = useChainIdValid(pluginID, chainId)
    const Others = useWeb3Others()

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    // #region trade state
    const {
        setIsSwapping,
        tradeState: [{ inputToken, outputToken, inputTokenBalance, inputAmount }, dispatchTradeStore],
        allTradeComputed,
        setTemporarySlippage,
    } = AllProviderTradeContext.useContainer()
    // #endregion

    // #region gas config and gas price
    const { gasPrice, gasConfig, setGasConfig } = useGasConfig(chainId)
    // #endregion

    useImperativeHandle(
        ref,
        () => ({
            gasConfig,
            focusedTrade,
            refresh: () => {
                allTradeComputed.map((x) => x.retry())
            },
        }),
        [allTradeComputed, focusedTrade, gasConfig],
    )

    useEffect(() => {
        if (!chainIdValid || !chainIdList.includes(chainId)) setChainId(ChainId.Mainnet)
    }, [chainIdValid, chainIdList, chainId])

    // #region if chain id be changed, update input token be native token
    useEffect(() => {
        if (!chainIdValid) return

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: Others.createNativeToken(chainId),
        })
    }, [chainId, chainIdValid, Others.createNativeToken])
    // #endregion

    const updateTradingCoin = useCallback(
        (
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN | AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            coin?: Web3Helper.FungibleTokenAll,
        ) => {
            if (!coin?.address) return
            dispatchTradeStore({
                type,
                token: coin,
            })
        },
        [],
    )
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_INPUT_TOKEN, defaultInputCoin)
    }, [updateTradingCoin, defaultInputCoin])
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN, defaultOutputCoin)
    }, [updateTradingCoin, defaultOutputCoin])

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])

    // #region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        pluginID,
        inputToken?.address ?? '',
        { chainId },
    )

    const { value: outputTokenBalance_, loading: loadingOutputTokenBalance } = useFungibleTokenBalance(
        pluginID,
        outputToken?.address ?? '',
        { chainId },
    )

    useEffect(() => {
        if (!inputTokenBalance_ || loadingInputTokenBalance || !inputToken) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: inputTokenBalance_,
        })
    }, [inputTokenBalance_, loadingInputTokenBalance, inputToken])

    useEffect(() => {
        if (!outputTokenBalance_ || loadingOutputTokenBalance || outputToken) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: outputTokenBalance_,
        })
    }, [outputTokenBalance_, loadingOutputTokenBalance, outputToken])

    // #region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]

    const selectFungibleToken = useSelectFungibleToken()
    const onTokenChipClick = useCallback(
        async (panelType: TokenPanelType) => {
            if (!account) {
                openConnectWalletDialog()
                return
            }
            const picked = await selectFungibleToken({
                chainId,
                disableNativeToken: false,
                selectedTokens: excludeTokens,
            })
            if (picked) {
                dispatchTradeStore({
                    type:
                        panelType === TokenPanelType.Input
                            ? AllProviderTradeActionType.UPDATE_INPUT_TOKEN
                            : AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: picked,
                    balance: '0',
                })
            }
        },
        [excludeTokens.join(','), chainId, account],
    )
    // #endregion

    // #region blocking (swap)
    const [{ loading: isTrading }, tradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
        gasConfig,
    )

    useEffect(() => {
        setIsSwapping(isTrading)
    }, [isTrading])

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
        return focusedTrade?.value && inputToken && outputToken
            ? t.share_text({
                  input_amount: formatBalance(focusedTrade.value.inputAmount, inputToken.decimals, 6),
                  input_symbol: `${cashTag}${inputToken.symbol}`,
                  output_amount: formatBalance(focusedTrade.value.outputAmount, outputToken.decimals, 6),
                  output_symbol: `${cashTag}${outputToken.symbol}`,
                  account_promote: t.account_promote({
                      context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
                  }),
              })
            : ''
    }, [focusedTrade?.value, inputToken, outputToken, t])
    const openShareTxDialog = useOpenShareTxDialog()
    const onConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await delay(100)
        const hash = await tradeCallback()

        setTemporarySlippage(undefined)

        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            buttonLabel: activatedSocialNetworkUI.utils.share ? 'Share' : 'Confirm',
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
        telemetry.captureEvent(TelemetryAPI.EventType.Interact, TelemetryAPI.EventID.SendTraderTransactionSuccessfully)
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount: '',
        })
    }, [tradeCallback, shareText, openShareTxDialog, telemetry])

    const onConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
    }, [])
    // #endregion

    // #region the click handler of switch arrow
    const onSwitchToken = useCallback(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.SWITCH_TOKEN,
            inputToken: outputToken,
            outputToken: inputToken,
            inputBalance: outputToken ? outputTokenBalance_ ?? '0' : '0',
            outputBalance: inputTokenBalance_ ?? '0',
        })
    }, [dispatchTradeStore, inputToken, outputToken, inputAmount, inputTokenBalance_, outputTokenBalance_])

    // #region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [focusedTrade, tradeCallback])
    // #endregion

    // #region The trades sort by best price (Estimate received * price - Gas fee * native token price)
    const sortedAllTradeComputed = useSortedTrades(allTradeComputed, chainId, gasPrice)
    // #endregion

    // Query the balance of native tokens on target chain
    useUpdateBalance(chainId)
    // #endregion

    // #region reset focused trade when chainId, inputToken, outputToken, inputAmount be changed
    useUpdateEffect(() => {
        setFocusTrade(undefined)
    }, [targetChainId, inputToken, outputToken, inputAmount])
    // #endregion

    // #region if chain id be changed, reset the chain id on context, and reset gas config
    useEffect(() => {
        if (!Others.isValidChainId(chainId)) return
        setGasConfig(undefined)
    }, [chainId, Others])
    // #endregion

    // #region if target chain id be changed, reset output token
    useUpdateEffect(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    }, [targetChainId])
    // #endregion

    useEffect(() => {
        return PluginTraderMessages.swapSettingsUpdated.on((event) => {
            if (event.open) return

            if (event.gasConfig) {
                setGasConfig(event.gasConfig)
            }
        })
    }, [])

    useUnmount(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    })

    useMountReport(TelemetryAPI.EventID.AccessTradePlugin)

    // #region if trade has been changed, update the focused trade
    useUpdateEffect(() => {
        setFocusTrade((prev) => {
            const target = allTradeComputed.find((x) => prev?.provider === x.provider)
            return target ?? prev
        })
    }, [allTradeComputed])
    // #endregion

    // #region hack for smartPay, will be removed
    const maskTokenAddress = useMaskTokenAddress()

    const { value: smartPayConfig } = useAsync(async () => {
        const smartPayChainId = await SmartPayBundler.getSupportedChainId()
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        const ratio = await depositPaymaster.getRatio()

        return {
            ratio,
            smartPayChainId,
        }
    }, [])

    const actualBalance = useMemo(() => {
        if (
            !wallet?.owner ||
            chainId !== smartPayConfig?.smartPayChainId ||
            !isSameAddress(inputToken?.address, maskTokenAddress)
        )
            return inputTokenBalance

        return toFixed(
            minus(
                inputTokenBalance,

                new BigNumber((gasConfig as EIP1559GasConfig).maxFeePerGas)
                    .multipliedBy(
                        focusedTrade?.gas.value && !isZero(focusedTrade?.gas.value)
                            ? addGasMargin(focusedTrade?.gas.value)
                            : '150000',
                    )
                    .integerValue()
                    .multipliedBy(smartPayConfig?.ratio ?? 1),
            ),
            0,
        )
    }, [
        gasConfig,
        wallet,
        inputToken?.address,
        maskTokenAddress,
        smartPayConfig,
        chainId,
        inputTokenBalance,
        focusedTrade,
    ])
    // #endregion

    return (
        <>
            <TradeForm
                isSmartPay={
                    !!wallet?.owner &&
                    chainId === smartPayConfig?.smartPayChainId &&
                    isSameAddress(inputToken?.address, maskTokenAddress)
                }
                settings={settings}
                classes={props.classes}
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={actualBalance}
                inputAmount={inputAmount}
                onInputAmountChange={onInputAmountChange}
                onTokenChipClick={onTokenChipClick}
                focusedTrade={focusedTrade}
                onFocusedTradeChange={(trade) => setFocusTrade(trade)}
                gasPrice={gasPrice}
                gasConfig={gasConfig}
                onSwitch={onSwitchToken}
            />
            {focusedTrade?.value && !isNativeTokenWrapper(focusedTrade.value) && inputToken && outputToken ? (
                <ConfirmDialog
                    open={openConfirmDialog}
                    trade={focusedTrade.value}
                    gas={focusedTrade.gas.value}
                    gasPrice={gasPrice}
                    gasConfig={gasConfig}
                    inputToken={inputToken}
                    outputToken={outputToken}
                    onConfirm={onConfirm}
                    onClose={onConfirmDialogClose}
                />
            ) : null}

            <TraderStateBar
                settings={settings}
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={actualBalance}
                inputAmount={inputAmount}
                focusedTrade={focusedTrade}
                gasPrice={gasPrice}
                onSwap={onSwap}
            />
        </>
    )
})
