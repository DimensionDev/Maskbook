import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles, useCustomSnackbar, useStylesExtends } from '@masknet/theme'
import {
    ChainId,
    createERC20Token,
    createNativeToken,
    EthereumTokenType,
    formatBalance,
    formatGweiToWei,
    FungibleTokenDetailed,
    GasOptionConfig,
    getNetworkTypeFromChainId,
    resolveTransactionLinkOnExplorer,
    TransactionStateType,
    useChainId,
    useChainIdValid,
    useFungibleTokenBalance,
    useWallet,
} from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared'
import type { Coin } from '../../types'
import { TokenPanelType, TradeInfo } from '../../types'
import { delay, useI18N } from '../../../../utils'
import { TradeForm } from './TradeForm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { UST } from '../../constants'
import { SelectTokenDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { useAsync, useTimeoutFn, useUpdateEffect } from 'react-use'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { isNativeTokenWrapper } from '../../helpers'
import { ConfirmDialog } from './ConfirmDialog'
import Services from '../../../../extension/service'
import { currentAccountSettings, currentBalancesSettings, currentProviderSettings } from '../../../Wallet/settings'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'
import { WalletRPC } from '../../../Wallet/messages'
import { PluginTraderMessages } from '../../messages'
import { NetworkType } from '@masknet/public-api'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice, useTokenPrice } from '../../../Wallet/hooks/useTokenPrice'
import { Link, Typography } from '@mui/material'
import { ExternalLink } from 'react-feather'

const useStyles = makeStyles()(() => {
    return {
        root: {
            width: 535,
            margin: 'auto',
        },
    }
})

export interface TraderProps extends withClasses<never> {
    coin?: Coin
    tokenDetailed?: FungibleTokenDetailed
    chainId?: ChainId
}

export function Trader(props: TraderProps) {
    const tradeRef = useRef<TradeInfo | undefined>()
    const { coin, tokenDetailed, chainId: targetChainId } = props
    const { decimals } = tokenDetailed ?? coin ?? {}
    const [focusedTrade, setFocusTrade] = useState<TradeInfo>()
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const wallet = useWallet()
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const chainIdValid = useChainIdValid()
    const currentAccount = useValueRef(currentAccountSettings)
    const currentProvider = useValueRef(currentProviderSettings)
    const classes = useStylesExtends(useStyles(), props)
    const { showSnackbar } = useCustomSnackbar()
    const { t } = useI18N()
    const { setTargetChainId } = TargetChainIdContext.useContainer()

    //#region trade state
    const {
        tradeState: [
            { inputToken, outputToken, inputTokenBalance, outputTokenBalance, inputAmount },
            dispatchTradeStore,
        ],
        allTradeComputed,
    } = AllProviderTradeContext.useContainer()
    //endregion

    useEffect(() => {
        if (!chainIdValid) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin?.is_mirrored ? UST[ChainId.Mainnet] : createNativeToken(chainId),
        })
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: coin?.contract_address
                ? createERC20Token(chainId, coin.contract_address, decimals ?? 0, coin.name ?? '', coin.symbol ?? '')
                : undefined,
        })
    }, [coin, chainId, chainIdValid, decimals])

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])

    //#region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        inputToken?.type ?? EthereumTokenType.Native,
        inputToken?.address ?? '',
    )

    const { value: outputTokenBalance_, loading: loadingOutputTokenBalance } = useFungibleTokenBalance(
        outputToken?.type ?? EthereumTokenType.Native,
        outputToken?.address ?? '',
        chainId,
    )

    useEffect(() => {
        if (inputToken?.type !== EthereumTokenType.Native && inputTokenBalance_ && !loadingInputTokenBalance)
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: inputTokenBalance_,
            })
        if (outputToken?.type !== EthereumTokenType.Native && outputTokenBalance_ && !loadingOutputTokenBalance)
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
                balance: outputTokenBalance_,
            })
    }, [
        inputToken,
        outputToken,
        inputTokenBalance_,
        outputTokenBalance_,
        loadingInputTokenBalance,
        loadingOutputTokenBalance,
    ])

    // Query the balance of native tokens on target chain
    useAsync(async () => {
        if (chainId) {
            const cacheBalance = currentBalancesSettings.value[currentProvider][chainId]

            let balance: string

            if (cacheBalance) balance = cacheBalance
            else {
                balance = await Services.Ethereum.getBalance(currentAccount, {
                    chainId: chainId,
                    providerType: currentProvider,
                })
                await WalletRPC.updateBalances({
                    [currentProvider]: {
                        [chainId]: balance,
                    },
                })
            }

            if (inputToken?.type === EthereumTokenType.Native)
                dispatchTradeStore({ type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE, balance })

            if (outputToken?.type === EthereumTokenType.Native)
                dispatchTradeStore({ type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE, balance })
        }
    }, [inputToken, outputToken, currentAccount, currentProvider, chainId, currentChainId])
    // #endregion

    // #region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenPanelType.Input)

    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== String(focusedTokenPanelType)) return
                dispatchTradeStore({
                    type:
                        focusedTokenPanelType === TokenPanelType.Input
                            ? AllProviderTradeActionType.UPDATE_INPUT_TOKEN
                            : AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: ev.token,
                })
                if (focusedTokenPanelType === TokenPanelType.Input) {
                    dispatchTradeStore({
                        type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
                        amount: '',
                    })
                }
            },
            [dispatchTradeStore, focusedTokenPanelType],
        ),
    )

    const onTokenChipClick = useCallback(
        (type: TokenPanelType) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                chainId,
                open: true,
                uuid: String(type),
                disableNativeToken: false,
                FixedTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join(), chainId],
    )
    //#endregion

    //#region blocking (swap)
    const [tradeState, tradeCallback, resetTradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
        gasConfig,
    )
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const onConfirmDialogConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await delay(100)
        await tradeCallback()
    }, [tradeCallback])

    const onConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
    }, [])
    //#endregion

    //#region refresh pairs
    const [, , resetTimeout] = useTimeoutFn(() => {
        // FIXME:
        // failed to update onRefreshClick callback
        onRefreshClick()
    }, 30 /* seconds */ * 1000 /* milliseconds */)

    const onRefreshClick = useCallback(async () => {
        allTradeComputed.forEach((trade) => trade.retry())
        resetTimeout()
    }, [allTradeComputed, resetTimeout])
    //#endregion

    //#region remote controlled transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            focusedTrade?.value && inputToken && outputToken
                ? [
                      `I just swapped ${formatBalance(
                          focusedTrade.value.inputAmount,
                          inputToken.decimals,
                          6,
                      )} ${cashTag}${inputToken.symbol} for ${formatBalance(
                          focusedTrade.value.outputAmount,
                          outputToken.decimals,
                          6,
                      )} ${cashTag}${outputToken.symbol}.${
                          isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                              ? `Follow @${
                                    isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                                } (mask.io) to swap cryptocurrencies on ${
                                    isTwitter(activatedSocialNetworkUI) ? 'Twitter' : 'Facebook'
                                }.`
                              : ''
                      }`,
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()
    //#endregion

    //#region close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (tradeState?.type === TransactionStateType.HASH) {
                dispatchTradeStore({
                    type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
                    amount: '',
                })
            }
            resetTradeCallback()
        },
    )
    //#endregion

    //#region get gas price
    const { value: gasPrice } = useAsync(async () => {
        try {
            const network = getNetworkTypeFromChainId(chainId)
            if (gasConfig) {
                return new BigNumber(
                    (network === NetworkType.Ethereum ? gasConfig.maxFeePerGas : gasConfig.gasPrice) ?? 0,
                ).toString()
            } else {
                if (network === NetworkType.Ethereum) {
                    const response = await WalletRPC.getEstimateGasFees(chainId)
                    const maxFeePerGas = formatGweiToWei(response?.medium.suggestedMaxFeePerGas ?? 0).toString()
                    const maxPriorityFeePerGas = formatGweiToWei(
                        response?.medium.suggestedMaxPriorityFeePerGas ?? 0,
                    ).toString()
                    setGasConfig({
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    })

                    return maxFeePerGas
                } else {
                    const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
                    const gasPrice = new BigNumber(response?.data.normal.price ?? 0).toString()
                    setGasConfig({
                        gasPrice,
                    })

                    return gasPrice
                }
            }
        } catch {
            return '0'
        }
    }, [chainId, gasConfig])
    //#endregion

    //#region open the transaction dialog
    useEffect(() => {
        if (tradeState?.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: tradeState,
        })
    }, [tradeState /* update tx dialog only if state changed */])
    //#endregion

    useUpdateEffect(() => {
        const { current: tradeInfo } = tradeRef
        if (tradeInfo?.value && tradeState) {
            const { inputAmount, outputAmount, inputToken, outputToken } = tradeInfo.value
            switch (tradeState.type) {
                case TransactionStateType.HASH:
                    showSnackbar(t('plugin_trader_swap_token'), {
                        variant: 'success',
                        message: (
                            <Typography display="flex" alignItems="center">
                                {t('plugin_trader_price_pairs', {
                                    input: formatBalance(inputAmount, inputToken?.decimals, 4),
                                    output: formatBalance(outputAmount, outputToken?.decimals, 4),
                                })}
                                <Link
                                    style={{ color: 'inherit', height: 20 }}
                                    href={resolveTransactionLinkOnExplorer(chainId, tradeState.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <ExternalLink size={12} />
                                </Link>
                            </Typography>
                        ),
                    })
                    break
                case TransactionStateType.FAILED:
                    showSnackbar(t('plugin_trader_swap_token'), {
                        variant: 'error',
                        message: t('plugin_wallet_transaction_rejected'),
                    })
                    break
                case TransactionStateType.WAIT_FOR_CONFIRMING:
                    showSnackbar(t('plugin_trader_swap_token'), {
                        message: t('plugin_trader_price_pairs', {
                            input: formatBalance(inputAmount, inputToken?.decimals, 4),
                            output: formatBalance(outputAmount, outputToken?.decimals, 4),
                        }),
                        processing: true,
                    })
                    break
                default:
                    return
            }
        }
    }, [tradeState, chainId])

    //#region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [focusedTrade, tradeCallback])
    //#endregion

    //#region The trades sort by best price (Estimate received * price - Gas fee * native token price)
    const nativeTokenPrice = useNativeTokenPrice(chainId)
    const outputTokenPrice = useTokenPrice(chainId, outputToken?.address.toLowerCase())
    const sortedAllTradeComputed = useMemo(() => {
        if (outputToken && outputTokenPrice) {
            return allTradeComputed
                .map((trade) => {
                    if (gasPrice && trade.value && trade.gas.value) {
                        const gasFee = new BigNumber(gasPrice).multipliedBy(trade.gas.value).integerValue().toFixed()

                        const gasFeeUSD = new BigNumber(formatBalance(gasFee ?? 0, outputToken.decimals)).times(
                            nativeTokenPrice,
                        )

                        const finalPrice = new BigNumber(
                            formatBalance(trade.value.outputAmount, outputToken.decimals, 2),
                        )
                            .times(outputToken.type !== EthereumTokenType.Native ? outputTokenPrice : nativeTokenPrice)
                            .minus(gasFeeUSD)

                        return {
                            ...trade,
                            finalPrice,
                        }
                    }
                    return trade
                })
                .filter(({ finalPrice }) => !!finalPrice)
                .sort(({ finalPrice: a }, { finalPrice: b }) => {
                    if (a && b && new BigNumber(a).isGreaterThan(b)) return -1
                    if (a && b && new BigNumber(a).isLessThan(b)) return 1
                    return 0
                })
        }
        return allTradeComputed
            .filter(({ value }) => !!value)
            .sort(({ value: a }, { value: b }) => {
                if (a?.outputAmount.isGreaterThan(b?.outputAmount ?? 0)) return -1
                if (a?.outputAmount.isLessThan(b?.outputAmount ?? 0)) return 1
                return 0
            })
    }, [allTradeComputed, outputToken, gasPrice, outputTokenPrice, nativeTokenPrice])
    //#endregion

    //#region reset focused trade when chainId, inputToken, outputToken, inputAmount be changed
    useUpdateEffect(() => {
        setFocusTrade(undefined)
    }, [targetChainId, inputToken, outputToken, inputAmount])
    //#endregion

    useUpdateEffect(() => {
        if (chainId) {
            setTargetChainId(chainId)
            setGasConfig(undefined)
        }
    }, [chainId])

    useUpdateEffect(() => {
        if (focusedTrade) tradeRef.current = focusedTrade
    }, [focusedTrade])

    useEffect(() => {
        return PluginTraderMessages.swapSettingsUpdated.on((event) => {
            if (event.open) return
            if (event.gasConfig) setGasConfig(event.gasConfig)
        })
    }, [])

    return (
        <div className={classes.root}>
            <TradeForm
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                onInputAmountChange={onInputAmountChange}
                onTokenChipClick={onTokenChipClick}
                onRefreshClick={onRefreshClick}
                focusedTrade={focusedTrade}
                onFocusedTradeChange={(trade) => setFocusTrade(trade)}
                onSwap={onSwap}
                gasPrice={gasPrice}
            />
            {focusedTrade?.value && !isNativeTokenWrapper(focusedTrade.value) && inputToken && outputToken ? (
                <ConfirmDialog
                    wallet={wallet}
                    open={openConfirmDialog}
                    trade={focusedTrade.value}
                    gas={focusedTrade.gas.value}
                    gasPrice={gasPrice}
                    inputToken={inputToken}
                    outputToken={outputToken}
                    onConfirm={onConfirmDialogConfirm}
                    onClose={onConfirmDialogClose}
                />
            ) : null}
        </div>
    )
}
