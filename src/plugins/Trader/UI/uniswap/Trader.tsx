import React, { useState, useCallback, useEffect } from 'react'
import { makeStyles, Theme, createStyles, CircularProgress } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { WalletMessageCenter, MaskbookWalletMessages } from '../../../Wallet/messages'
import { useToken } from '../../../../web3/hooks/useToken'
import { Token, EthereumTokenType } from '../../../../web3/types'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { useBestTrade } from '../../uniswap/useBestTrade'
import { TradeForm } from './TradeForm'
import { TradeRoute } from './TradeRoute'
import { TradeSummary } from './TradeSummary'
import { ConfirmDialog } from './ConfirmDialog'
import { useTokenApproveCallback, ApproveState } from '../../../../web3/hooks/useTokenApproveCallback'
import { useComputedApprove } from '../../uniswap/useComputedApprove'
import { useSwapCallback } from '../../uniswap/useSwapCallback'
import { useSwapState, SwapActionType } from '../../uniswap/useSwapState'
import { TradeStrategy } from '../../types'
import { isSameAddress } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'
import { TRADE_CONSTANTS } from '../../constants'

const useStyles = makeStyles((theme: Theme) => {
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

    //#region swap state
    const [swapState, dispatchSwapState] = useSwapState(undefined, undefined)
    const { inputToken, outputToken } = swapState

    const [inputTokenAddress, setInputTokenAddress] = useState(ETH_ADDRESS)
    const [outputTokenAddress, setOutputTokenAddress] = useState(address === ETH_ADDRESS ? '' : address)

    const isEtherInput = inputTokenAddress === ETH_ADDRESS
    const isEtherOutput = outputTokenAddress === ETH_ADDRESS

    const asyncInputToken = useToken({
        type: isEtherInput ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        address: isEtherInput ? ETH_ADDRESS : inputTokenAddress,
    })
    const asyncOutputToken = useToken({
        type: isEtherOutput ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        address: isEtherOutput ? ETH_ADDRESS : outputTokenAddress,
        name,
        symbol,
    })

    useEffect(() => {
        dispatchSwapState({
            type: SwapActionType.UPDATE_INPUT_TOKEN,
            token: asyncInputToken.value,
        })
        dispatchSwapState({
            type: SwapActionType.UPDATE_OUTPUT_TOKEN,
            token: asyncOutputToken.value,
        })
    }, [asyncInputToken.value, asyncOutputToken.value])
    //#endregion

    //#region select token
    const [focusedTokenAddress, setFocusedTokenAddress] = useState<string>('')

    // select token in the remote controlled dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectERC20TokenDialogUpdated'>(
        WalletMessageCenter,
        'selectERC20TokenDialogUpdated',
        useCallback(
            (ev: MaskbookWalletMessages['selectERC20TokenDialogUpdated']) => {
                if (ev.open) return
                const { address = '' } = ev.token ?? {}
                if (!address) return
                isSameAddress(inputTokenAddress, focusedTokenAddress)
                    ? setInputTokenAddress(address)
                    : setOutputTokenAddress(address)
            },
            [inputTokenAddress, focusedTokenAddress],
        ),
    )

    // open select token dialog
    const lists = useConstant(CONSTANTS, 'TOKEN_LISTS')
    const onTokenChipClick = useCallback(
        (token: Token) => {
            setFocusedTokenAddress(token?.address ?? '')
            setOpen({
                open: true,
                address: token?.address,
                lists,
                excludeTokens: [inputTokenAddress, outputTokenAddress].filter(Boolean),
            })
        },
        [setOpen, inputTokenAddress, outputTokenAddress],
    )
    //#endregion

    //#region switch tokens
    const onReverseClick = useCallback(() => {
        dispatchSwapState({
            type: SwapActionType.SWITCH_TOKEN,
        })
    }, [])
    //#endregion

    //#region the best trade
    const { inputAmount, outputAmount, strategy } = swapState

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchSwapState({
            type: SwapActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])
    const onOutputAmountChange = useCallback((amount: string) => {
        dispatchSwapState({
            type: SwapActionType.UPDATE_OUTPUT_AMOUNT,
            amount,
        })
    }, [])

    const trade = useBestTrade(strategy, inputAmount, outputAmount, inputToken, outputToken)

    // only keeps 6 digits in the fraction part for the estimation amount
    const isExactIn = strategy === TradeStrategy.ExactIn
    const estimatedInputAmount = new BigNumber(trade.v2Trade?.inputAmount.toSignificant(6) ?? '0')
        .multipliedBy(new BigNumber(10).pow(trade.v2Trade?.route.input.decimals ?? 0))
        .toFixed()
    const estimatedOutputAmount = new BigNumber(trade.v2Trade?.outputAmount.toSignificant(6) ?? '0')
        .multipliedBy(new BigNumber(10).pow(trade.v2Trade?.route.output.decimals ?? 0))
        .toFixed()
    //#endregion

    //#region approve
    const RouterV2Address = useConstant(TRADE_CONSTANTS, 'ROUTER_V2_ADDRESS')
    const { approveToken, approveAmount } = useComputedApprove(trade.v2Trade)
    const [approveState, approveCallback] = useTokenApproveCallback(approveToken, approveAmount, RouterV2Address)
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        const hash = await approveCallback()

        console.log('DEBUG: approve hash')
        console.log(hash)

        // submit to queue
    }, [approveState])
    //#endregion

    //#region swap
    const swapCallback = useSwapCallback(trade.v2Trade)
    const onConfirm = useCallback(async () => {
        const hash = await swapCallback()

        console.log('DEBUG: swap hash')
        console.log(hash)
    }, [swapCallback])
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    //#endregion

    return (
        <div className={classes.root}>
            <TradeForm
                approveState={approveState}
                trade={trade.v2Trade}
                inputToken={inputToken}
                outputToken={outputToken}
                inputAmount={
                    isExactIn ? trade.v2Trade?.inputAmount.raw.toString() ?? inputAmount : estimatedInputAmount
                }
                outputAmount={
                    isExactIn ? estimatedOutputAmount : trade.v2Trade?.outputAmount.raw.toString() ?? outputAmount
                }
                onInputAmountChange={onInputAmountChange}
                onOutputAmountChange={onOutputAmountChange}
                onReverseClick={onReverseClick}
                onTokenChipClick={onTokenChipClick}
                onApprove={onApprove}
                onSwap={() => setOpenConfirmDialog(true)}
            />
            <TradeSummary trade={trade.v2Trade} inputToken={inputToken} outputToken={outputToken} />
            <TradeRoute classes={{ root: classes.router }} trade={trade.v2Trade} />
            <ConfirmDialog
                trade={trade.v2Trade}
                inputToken={inputToken}
                outputToken={outputToken}
                open={openConfirmDialog}
                onConfirm={onConfirm}
                onClose={() => setOpenConfirmDialog(false)}
            />
            {asyncInputToken.loading || asyncOutputToken.loading ? (
                <CircularProgress className={classes.progress} size={15} />
            ) : null}
        </div>
    )
}
