import React, { useState, useEffect } from 'react'
import { Button, makeStyles, Theme, createStyles, DialogActions, DialogContent, Typography } from '@material-ui/core'
import type { Trade } from '@uniswap/sdk'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { TradeSummary, TradeSummaryProps } from './TradeSummary'
import type { Token } from '../../../../web3/types'
import { TokenPanel } from './TokenPanel'
import { useComputedTrade } from '../../uniswap/useComputedTrade'
import { PriceStaleWarnning } from './PriceStaleWarnning'
import type { TradeStrategy } from '../../types'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        reverseIcon: {
            width: 16,
            height: 16,
            marginLeft: 5,
        },
        tip: {
            fontSize: 11,
            margin: theme.spacing(1, 0, 2),
        },
        summary: {
            marginTop: theme.spacing(1),
            marginBottom: 0,
        },
        button: {
            paddingTop: 12,
            paddingBottom: 12,
        },
    }),
)

export interface ConfirmDialogUIProps extends withClasses<never> {
    trade: Trade | null
    strategy: TradeStrategy
    inputToken?: Token
    outputToken?: Token
    open: boolean
    onConfirm: () => void
    onClose?: () => void
    UniswapTradeSummaryProps?: Partial<TradeSummaryProps>
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const { t } = useI18N()

    const classes = useStylesExtends(useStyles(), props)
    const { trade, strategy, inputToken, outputToken, open, onConfirm, onClose, UniswapTradeSummaryProps } = props

    //#region detect price changing
    const [executionPrice, setExecutionPrice] = useState(trade?.executionPrice)
    useEffect(() => {
        if (open) setExecutionPrice(undefined)
    }, [open])
    useEffect(() => {
        if (trade && typeof executionPrice === 'undefined') setExecutionPrice(trade.executionPrice)
    }, [trade, executionPrice])
    //#endregion

    const computedTrade = useComputedTrade(trade)
    const staled = !!(trade && executionPrice && !executionPrice.equalTo(trade.executionPrice))

    return (
        <>
            <InjectedDialog open={open} onExit={onClose} title="Confirm Swap">
                <DialogContent>
                    {inputToken && outputToken ? (
                        <>
                            <TokenPanel amount={trade?.inputAmount.raw.toString() ?? '0'} token={inputToken} />
                            <ArrowDownwardIcon className={classes.reverseIcon} />
                            <TokenPanel amount={trade?.outputAmount.raw.toString() ?? '0'} token={outputToken} />
                        </>
                    ) : null}
                    {staled ? (
                        <PriceStaleWarnning
                            onAccept={() => {
                                setExecutionPrice(trade?.executionPrice)
                            }}
                        />
                    ) : null}
                    <Typography
                        className={classes.tip}
                        color="textSecondary">{`Output is estimated. You will receive at least ${
                        computedTrade?.minimumReceived.toSignificant(9) ?? '0'
                    } ${trade?.outputAmount.currency.symbol} or the transaction will revert.`}</Typography>
                    <TradeSummary
                        classes={{ root: classes.summary }}
                        trade={trade}
                        strategy={strategy}
                        inputToken={inputToken}
                        outputToken={outputToken}
                        {...UniswapTradeSummaryProps}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        classes={{ root: classes.button }}
                        color="primary"
                        size="large"
                        variant="contained"
                        fullWidth
                        disabled={staled}
                        onClick={onConfirm}>
                        Confirm Swap
                    </Button>
                </DialogActions>
            </InjectedDialog>
        </>
    )
}

export interface ConfirmDialogProps extends ConfirmDialogUIProps {}

export function ConfirmDialog(props: ConfirmDialogProps) {
    return <ConfirmDialogUI {...props} />
}
