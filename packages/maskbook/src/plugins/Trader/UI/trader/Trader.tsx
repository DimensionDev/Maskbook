import { useState, useCallback, useEffect, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core'
import type { Trade } from '@uniswap/sdk'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../../web3/types'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { TradeForm } from './TradeForm'
import { TradeRoute } from '../uniswap/TradeRoute'
import { TradeSummary } from '../trader/TradeSummary'
import { ConfirmDialog } from './ConfirmDialog'
import { useERC20TokenApproveCallback, ApproveState } from '../../../../web3/hooks/useERC20TokenApproveCallback'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed'
import { TradeActionType } from '../../trader/useTradeState'
import { TokenPanelType, TradeComputed, TradeProvider } from '../../types'
import { CONSTANTS } from '../../../../web3/constants'
import { TRADE_CONSTANTS } from '../../constants'
import { sleep } from '../../../../utils/utils'
import { TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import { SelectERC20TokenDialog } from '../../../../web3/UI/SelectERC20TokenDialog'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../../Wallet/messages'
import { useShareLink } from '../../../../utils/hooks/useShareLink'
import { useTokenDetailed } from '../../../../web3/hooks/useTokenDetailed'
import { formatBalance } from '../../../Wallet/formatter'
import { TradePairViewer } from '../uniswap/TradePairViewer'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { currentTradeProviderSettings } from '../../settings'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { useTradeStateComputed } from '../../trader/useTradeStateComputed'
import { useTokenBalance } from '../../../../web3/hooks/useTokenBalance'
import { getActivatedUI } from '../../../../social-network/ui'

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
    address: string
    name: string
    symbol: string
}

export function Trader(props: TraderProps) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const { address, name, symbol } = props
    const classes = useStylesExtends(useStyles(), props)

    const provider = useValueRef(currentTradeProviderSettings)

    //#region trade state
    const {
        tradeState: [tradeStore, dispatchTradeStore],
        tradeComputed: { value: tradeComputed, ...asyncTradeComputed },
    } = useTradeStateComputed(provider)
    const { inputToken, outputToken } = tradeStore

    const [inputTokenAddress, setInputTokenAddress] = useState(ETH_ADDRESS)
    const [outputTokenAddress, setOutputTokenAddress] = useState(address === ETH_ADDRESS ? '' : address)

    const isEtherInput = inputTokenAddress === ETH_ADDRESS
    const isEtherOutput = outputTokenAddress === ETH_ADDRESS

    const asyncInputTokenDetailed = useTokenDetailed(
        isEtherInput ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        isEtherInput ? ETH_ADDRESS : inputTokenAddress,
        {
            name,
            symbol,
        },
    )
    const asyncOutputTokenDetailed = useTokenDetailed(
        isEtherOutput ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        isEtherOutput ? ETH_ADDRESS : outputTokenAddress,
        {
            name,
            symbol,
        },
    )

    useEffect(() => {
        dispatchTradeStore({
            type: TradeActionType.UPDATE_INPUT_TOKEN,
            token: asyncInputTokenDetailed.value,
        })
        dispatchTradeStore({
            type: TradeActionType.UPDATE_OUTPUT_TOKEN,
            token: asyncOutputTokenDetailed.value,
        })
    }, [asyncInputTokenDetailed.value, asyncOutputTokenDetailed.value])
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

    //#region select erc20 tokens
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const [focusedTokenPanelType, setfocusedTokenPanelType] = useState(TokenPanelType.Input)
    const onTokenChipClick = useCallback((type: TokenPanelType) => {
        setOpenSelectERC20TokenDialog(true)
        setfocusedTokenPanelType(type)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed) => {
            dispatchTradeStore({
                type:
                    focusedTokenPanelType === TokenPanelType.Input
                        ? TradeActionType.UPDATE_INPUT_TOKEN
                        : TradeActionType.UPDATE_OUTPUT_TOKEN,
                token,
            })
            onSelectERC20TokenDialogClose()
        },
        [focusedTokenPanelType, onSelectERC20TokenDialogClose],
    )
    //#endregion

    //#region approve
    const RouterV2Address = useConstant(TRADE_CONSTANTS, 'ROUTER_V2_ADDRESS')
    const { approveToken, approveAmount } = useTradeApproveComputed(trade, inputToken)
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        approveToken?.address ?? '',
        approveAmount,
        RouterV2Address,
    )
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState])

    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState])
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
        WalletMessages.events.transactionDialogUpdated,
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
                approveState={approveState}
                trade={trade}
                strategy={strategy}
                loading={asyncTradeComputed.loading}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                outputAmount={outputAmount}
                onInputAmountChange={onInputAmountChange}
                onOutputAmountChange={onOutputAmountChange}
                onReverseClick={onReverseClick}
                onTokenChipClick={onTokenChipClick}
                onApprove={onApprove}
                onExactApprove={onExactApprove}
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
                    {provider === TradeProvider.UNISWAP ? (
                        <>
                            <TradeRoute classes={{ root: classes.router }} trade={trade} />
                            <TradePairViewer trade={trade as TradeComputed<Trade>} />
                        </>
                    ) : null}
                </>
            ) : null}
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                includeTokens={[]}
                excludeTokens={excludeTokens}
                selectedTokens={[]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </div>
    )
}
