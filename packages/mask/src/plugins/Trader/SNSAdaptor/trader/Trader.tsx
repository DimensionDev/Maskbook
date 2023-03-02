import { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useMemo, useRef } from 'react'
import { useUnmount, useUpdateEffect } from 'react-use'
import { delay } from '@masknet/kit'
import { useOpenShareTxDialog, useSelectFungibleToken } from '@masknet/shared'
import { formatBalance } from '@masknet/web3-shared-base'
import { ChainId, GasConfig } from '@masknet/web3-shared-evm'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    useChainContext,
    useChainIdValid,
    useFungibleTokenBalance,
    useNetworkContext,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base.js'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base.js'
import { useI18N } from '../../locales/index.js'
import { isNativeTokenWrapper } from '../../helpers/index.js'
import { PluginTraderMessages } from '../../messages.js'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { useTradeCallback } from '../../trader/useTradeCallback.js'
import { TokenPanelType, TradeInfo } from '../../types/index.js'
import { ConfirmDialog } from './ConfirmDialog.js'
import { useSortedTrades } from './hooks/useSortedTrades.js'
import { useUpdateBalance } from './hooks/useUpdateBalance.js'
import { TradeForm } from './TradeForm.js'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TraderStateBar } from './TraderStateBar.js'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useMountReport, useTelemetry } from '@masknet/web3-telemetry/hooks'
import { TelemetryAPI } from '@masknet/web3-providers/types'

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
    const snackbarKeyRef = useRef<SnackbarKey>()
    const telemetry = useTelemetry()

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
    const { Others } = useWeb3State()

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined) closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current = showSnackbar(title, options)
            return () => {
                closeSnackbar(snackbarKeyRef.current)
            }
        },
        [showSnackbar, closeSnackbar],
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

    useUpdateEffect(() => {
        if (!chainIdValid || !chainIdList.includes(chainId)) setChainId(ChainId.Mainnet)
    }, [chainIdValid, chainIdList, chainId])

    // #region if chain id be changed, update input token be native token
    useEffect(() => {
        if (!chainIdValid) return

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: Others?.createNativeToken(chainId),
        })
    }, [chainId, chainIdValid, Others?.createNativeToken])
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
        [excludeTokens.join(), chainId],
    )
    // #endregion

    // #region blocking (swap)
    const [{ loading: isTrading, error: tradeCallbackError }, tradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
        gasConfig,
    )

    useUpdateEffect(() => {
        if (tradeCallbackError) showSingletonSnackbar(t.swap_failed(), { processing: false, variant: 'error' })
    }, [tradeCallbackError, showSingletonSnackbar])

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
        if (!Others?.isValidChainId(chainId)) return
        setGasConfig(undefined)
    }, [chainId])
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

    return (
        <>
            <TradeForm
                settings={settings}
                classes={props.classes}
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
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
                inputTokenBalance={inputTokenBalance}
                inputAmount={inputAmount}
                focusedTrade={focusedTrade}
                gasPrice={gasPrice}
                onSwap={onSwap}
            />
        </>
    )
})
