import { useState, useCallback, useEffect, useRef } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import { makeStyles, createStyles } from '@material-ui/core'
import type { Trade } from '@uniswap/sdk'
import { v4 as uuid } from 'uuid'

import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed, ChainId } from '../../../../web3/types'
import { TradeForm } from './TradeForm'
import { TradeRoute as UniswapTradeRoute } from '../uniswap/TradeRoute'
import { TradeRoute as BalancerTradeRoute } from '../balancer/TradeRoute'
import { TradeSummary } from '../trader/TradeSummary'
import { ConfirmDialog } from './ConfirmDialog'
import { useERC20TokenApproveCallback, ApproveState } from '../../../../web3/hooks/useERC20TokenApproveCallback'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { TradeActionType } from '../../trader/useTradeState'
import { SwapResponse, TokenPanelType, TradeComputed, TradeProvider, Coin } from '../../types'
import { TRADE_CONSTANTS } from '../../constants'
import { sleep } from '../../../../utils/utils'
import { TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { useShareLink } from '../../../../utils/hooks/useShareLink'
import { formatBalance } from '../../../Wallet/formatter'
import { TradePairViewer } from '../uniswap/TradePairViewer'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { currentTradeProviderSettings } from '../../settings'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { useTradeStateComputed } from '../../trader/useTradeStateComputed'
import { useTokenBalance } from '../../../../web3/hooks/useTokenBalance'
import { getActivatedUI } from '../../../../social-network/ui'
import { EthereumMessages } from '../../../Ethereum/messages'
import Services from '../../../../extension/service'
import { UST } from '../../constants'
import { SelectTokenDialogEvent, WalletMessages } from '../../../Wallet/messages'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { createERC20Token, createEtherToken } from '../../../../web3/helpers'
import { PluginTraderRPC } from '../../messages'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
    })
})

export interface TraderProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    coin: Coin
    tokenDetailed: ERC20TokenDetailed | EtherTokenDetailed | undefined
}

export function Trader(props: TraderProps) {
    const { coin, tokenDetailed } = props
    const { decimals } = tokenDetailed ?? coin
    const chainId = useChainId()
    const classes = useStylesExtends(useStyles(), props)

    const provider = useValueRef(currentTradeProviderSettings)

    //#region trade state
    const {
        tradeState: [tradeStore, dispatchTradeStore],
        tradeComputed: { value: tradeComputed, ...asyncTradeComputed },
    } = useTradeStateComputed(provider)
    const { inputToken, outputToken } = tradeStore

    useEffect(() => {
        dispatchTradeStore({
            type: TradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin.is_mirrored ? UST : createEtherToken(chainId),
        })
        dispatchTradeStore({
            type: TradeActionType.UPDATE_OUTPUT_TOKEN,
            token: coin.eth_address
                ? createERC20Token(chainId, coin.eth_address!, decimals ?? 0, coin.name ?? '', coin.symbol ?? '')
                : undefined,
        })
    }, [coin, chainId, decimals])
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
    } = useTokenBalance(inputToken?.type ?? EthereumTokenType.Ether, inputToken?.address ?? '')
    const {
        value: outputTokenBalance_,
        loading: loadingOutputTokenBalance,
        retry: retryOutputTokenBalance,
    } = useTokenBalance(outputToken?.type ?? EthereumTokenType.Ether, outputToken?.address ?? '')

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

    // the cached trade will freeze UI from updating when transaction was just confirmed
    const [freezed, setFreezed] = useState(false)
    const tradeCached_ = useRef<TradeComputed<unknown> | null>(tradeComputed)
    useEffect(() => {
        if (freezed) tradeCached_.current = tradeComputed
    }, [freezed /* update trade computed if the update button was clicked */])

    // the real tread for UI
    const trade = freezed ? tradeCached_.current : tradeComputed
    //#endregion

    //#region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenPanelType.Input)
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
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
            setSelectTokenDialogOpen({
                open: true,
                uuid: String(type),
                disableEther: false,
                FixedTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join()],
    )
    //#endregion

    //#region blocking (swap)
    const [tradeState, tradeCallback, resetTradeCallback] = useTradeCallback(provider, trade)
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const onConfirmDialogConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await sleep(100)
        setFreezed(true)
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
        await Services.Ethereum.updateChainState()
        asyncTradeComputed.retry()
        resetTimeout()
    }, [asyncTradeComputed.retry, resetTimeout])
    //#endregion

    //#region remote controlled transaction dialog
    const cashTag = getActivatedUI()?.networkIdentifier === 'twitter.com' ? '$' : ''
    const shareLink = useShareLink(
        trade && inputToken && outputToken
            ? [
                  `I just swapped ${formatBalance(trade.inputAmount, inputToken.decimals ?? 0, 6)} ${cashTag}${
                      inputToken.symbol
                  } for ${formatBalance(trade.outputAmount, outputToken.decimals ?? 0, 6)} ${cashTag}${
                      outputToken.symbol
                  }. Follow @realMaskbook (mask.io) to swap cryptocurrencies on Twitter.`,
                  '#mask_io',
              ].join('\n')
            : '',
    )

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            setFreezed(false)
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
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: tradeState,
            summary:
                trade && inputToken && outputToken
                    ? `Swapping ${formatBalance(trade.inputAmount, inputToken.decimals ?? 0, 6)} ${
                          inputToken.symbol
                      } for ${formatBalance(trade.outputAmount, outputToken.decimals ?? 0, 6)} ${outputToken.symbol}`
                    : '',
        })
    }, [tradeState /* update tx dialog only if state changed */])
    //#endregion

    return (
        <div className={classes.root}>
            <TradeForm
                trade={trade}
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
                onSwap={() => setOpenConfirmDialog(true)}
            />
            {trade && inputToken && outputToken ? (
                <>
                    <ConfirmDialog
                        open={openConfirmDialog}
                        trade={trade}
                        provider={provider}
                        inputToken={inputToken}
                        outputToken={outputToken}
                        onConfirm={onConfirmDialogConfirm}
                        onClose={onConfirmDialogClose}
                    />
                    <TradeSummary
                        classes={{ root: classes.summary }}
                        trade={trade}
                        provider={provider}
                        inputToken={inputToken}
                        outputToken={outputToken}
                    />
                    {[TradeProvider.UNISWAP, TradeProvider.SUSHISWAP, TradeProvider.SASHIMISWAP].includes(provider) ? (
                        <UniswapTradeRoute classes={{ root: classes.router }} trade={trade} />
                    ) : null}
                    {[TradeProvider.BALANCER].includes(provider) ? (
                        <BalancerTradeRoute
                            classes={{ root: classes.router }}
                            trade={trade as TradeComputed<SwapResponse>}
                        />
                    ) : null}
                    {[TradeProvider.UNISWAP, TradeProvider.SUSHISWAP, TradeProvider.SASHIMISWAP].includes(provider) ? (
                        <TradePairViewer trade={trade as TradeComputed<Trade>} provider={provider} />
                    ) : null}
                </>
            ) : null}
        </div>
    )
}
