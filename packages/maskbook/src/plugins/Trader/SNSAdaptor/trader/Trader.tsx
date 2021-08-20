import { useCallback, useContext, useEffect, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import { makeStyles } from '@masknet/theme'
import type { Trade } from '@uniswap/v2-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import {
    ChainId,
    createERC20Token,
    createNativeToken,
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    TransactionStateType,
    useChainId,
    useChainIdValid,
    useTokenBalance,
} from '@masknet/web3-shared'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { TradeForm } from './TradeForm'
import { TradeRoute as UniswapTradeRoute } from '../uniswap/TradeRoute'
import { TradeRoute as BalancerTradeRoute } from '../balancer/TradeRoute'
import { TradeSummary } from './TradeSummary'
import { ConfirmDialog } from './ConfirmDialog'
import { TradeActionType } from '../../trader/useTradeState'
import { Coin, SwapResponse, SwapRouteData, TokenPanelType, TradeComputed, TradeProvider } from '../../types'
import { TradePairViewer as UniswapPairViewer } from '../uniswap/TradePairViewer'
import { TradePairViewer as DODOPairViewer } from '../dodo/TradePairViewer'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { useTradeStateComputed } from '../../trader/useTradeStateComputed'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { UST } from '../../constants'
import { SelectTokenDialogEvent, WalletMessages } from '../../../Wallet/messages'
import { isNativeTokenWrapper } from '../../helpers'
import { TradeContext } from '../../trader/useTradeContext'
import { PluginTraderRPC } from '../../messages'
import { delay } from '../../../../utils'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 266,
            position: 'relative',
        },
        progress: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
        summary: {},
        router: {
            marginTop: 0,
        },
    }
})

export interface TraderProps extends withClasses<never> {
    coin?: Coin
    tokenDetailed?: FungibleTokenDetailed
}

export function Trader(props: TraderProps) {
    const { coin, tokenDetailed } = props
    const { decimals } = tokenDetailed ?? coin ?? {}

    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const classes = useStylesExtends(useStyles(), props)

    const context = useContext(TradeContext)
    const provider = context?.TYPE ?? TradeProvider.UNISWAP_V2

    //#region trade state
    const {
        tradeState: [tradeStore, dispatchTradeStore],
        tradeComputed: { value: tradeComputed, ...asyncTradeComputed },
    } = useTradeStateComputed(provider)
    const { inputToken, outputToken } = tradeStore

    useEffect(() => {
        if (!chainIdValid) return
        dispatchTradeStore({
            type: TradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin?.is_mirrored ? UST[ChainId.Mainnet] : createNativeToken(chainId),
        })
        dispatchTradeStore({
            type: TradeActionType.UPDATE_OUTPUT_TOKEN,
            token: coin?.contract_address
                ? createERC20Token(chainId, coin.contract_address, decimals ?? 0, coin.name ?? '', coin.symbol ?? '')
                : undefined,
        })
    }, [coin, chainId, chainIdValid, decimals])
    //#endregion

    //#region switch tokens
    const onReverseClick = useCallback(() => {
        dispatchTradeStore({
            type: TradeActionType.SWITCH_TOKEN,
        })
    }, [])
    //#endregion

    //#region update amount
    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: TradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])
    const onOutputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: TradeActionType.UPDATE_OUTPUT_AMOUNT,
            amount,
        })
    }, [])
    //#endregion

    //#region update balance
    const {
        value: inputTokenBalance_,
        loading: loadingInputTokenBalance,
        retry: retryInputTokenBalance,
    } = useTokenBalance(inputToken?.type ?? EthereumTokenType.Native, inputToken?.address ?? '')
    const {
        value: outputTokenBalance_,
        loading: loadingOutputTokenBalance,
        retry: retryOutputTokenBalance,
    } = useTokenBalance(outputToken?.type ?? EthereumTokenType.Native, outputToken?.address ?? '')

    useEffect(() => {
        if (inputTokenBalance_ && !loadingInputTokenBalance)
            dispatchTradeStore({
                type: TradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: inputTokenBalance_,
            })
        if (outputTokenBalance_ && !loadingOutputTokenBalance)
            dispatchTradeStore({
                type: TradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
                balance: outputTokenBalance_,
            })
    }, [inputTokenBalance_, outputTokenBalance_, loadingInputTokenBalance, loadingOutputTokenBalance])

    const onUpdateTokenBalance = useCallback(() => {
        retryInputTokenBalance()
        retryOutputTokenBalance()
    }, [retryInputTokenBalance, retryOutputTokenBalance])
    //#endregion

    //#region the best trade
    const { inputAmount, outputAmount, inputTokenBalance, outputTokenBalance, strategy } = tradeStore

    //#region select token
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
                            ? TradeActionType.UPDATE_INPUT_TOKEN
                            : TradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: ev.token,
                })
            },
            [dispatchTradeStore, focusedTokenPanelType],
        ),
    )
    const onTokenChipClick = useCallback(
        (type: TokenPanelType) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                open: true,
                uuid: String(type),
                disableNativeToken: false,
                FixedTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join()],
    )
    //#endregion

    //#region blocking (swap)
    const [tradeState, tradeCallback, resetTradeCallback] = useTradeCallback(provider, tradeComputed)
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

    //#region refresh pools
    const { error: updateBalancerPoolsError, loading: updateBalancerPoolsLoading } = useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true)
    }, [provider])
    //#endregion

    //#region refresh pairs
    const [, , resetTimeout] = useTimeoutFn(() => {
        // FIXME:
        // failed to update onRefreshClick callback
        onRefreshClick()
    }, 30 /* seconds */ * 1000 /* milliseconds */)

    const onRefreshClick = useCallback(async () => {
        asyncTradeComputed.retry()
        resetTimeout()
    }, [asyncTradeComputed.retry, resetTimeout])
    //#endregion

    //#region remote controlled transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            tradeComputed && inputToken && outputToken
                ? [
                      `I just swapped ${formatBalance(tradeComputed.inputAmount, inputToken.decimals, 6)} ${cashTag}${
                          inputToken.symbol
                      } for ${formatBalance(tradeComputed.outputAmount, outputToken.decimals, 6)} ${cashTag}${
                          outputToken.symbol
                      }. Follow @realMaskbook (mask.io) to swap cryptocurrencies on Twitter.`,
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (tradeState.type === TransactionStateType.HASH) {
                dispatchTradeStore({
                    type: TradeActionType.UPDATE_INPUT_AMOUNT,
                    amount: '',
                })
                dispatchTradeStore({
                    type: TradeActionType.UPDATE_OUTPUT_AMOUNT,
                    amount: '',
                })
            }
            resetTradeCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (tradeState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: tradeState,
        })
    }, [tradeState /* update tx dialog only if state changed */])
    //#endregion

    //#region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (tradeComputed && isNativeTokenWrapper(tradeComputed)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [tradeComputed])
    //#endregion

    return (
        <div className={classes.root}>
            <TradeForm
                trade={tradeComputed}
                provider={provider}
                strategy={strategy}
                loading={asyncTradeComputed.loading || updateBalancerPoolsLoading}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                outputAmount={outputAmount}
                onInputAmountChange={onInputAmountChange}
                onOutputAmountChange={onOutputAmountChange}
                onReverseClick={onReverseClick}
                onRefreshClick={onRefreshClick}
                onTokenChipClick={onTokenChipClick}
                onSwap={onSwap}
            />
            {tradeComputed && !isNativeTokenWrapper(tradeComputed) && inputToken && outputToken ? (
                <>
                    <ConfirmDialog
                        open={openConfirmDialog}
                        trade={tradeComputed}
                        provider={provider}
                        inputToken={inputToken}
                        outputToken={outputToken}
                        onConfirm={onConfirmDialogConfirm}
                        onClose={onConfirmDialogClose}
                    />
                    <TradeSummary
                        classes={{ root: classes.summary }}
                        trade={tradeComputed}
                        provider={provider}
                        inputToken={inputToken}
                        outputToken={outputToken}
                    />
                    {context?.IS_UNISWAP_V2_LIKE ? (
                        <UniswapTradeRoute classes={{ root: classes.router }} trade={tradeComputed} />
                    ) : null}
                    {[TradeProvider.BALANCER].includes(provider) ? (
                        <BalancerTradeRoute
                            classes={{ root: classes.router }}
                            trade={tradeComputed as TradeComputed<SwapResponse>}
                        />
                    ) : null}
                    {context?.IS_UNISWAP_V2_LIKE ? (
                        <UniswapPairViewer
                            trade={tradeComputed as TradeComputed<Trade<Currency, Currency, TradeType>>}
                            provider={provider}
                        />
                    ) : null}
                    {TradeProvider.DODO === provider ? (
                        <DODOPairViewer trade={tradeComputed as TradeComputed<SwapRouteData>} provider={provider} />
                    ) : null}
                </>
            ) : null}
        </div>
    )
}
