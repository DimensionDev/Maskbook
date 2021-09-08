import { useEffect, useState } from 'react'
import { Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import type BigNumber from 'bignumber.js'
import { useStylesExtends } from '@masknet/shared'
import { TradeSummary, TradeSummaryProps } from './TradeSummary'
import { TokenPanel } from './TokenPanel'
import { PriceStaleWarning } from './PriceStaleWarning'
import type { TradeComputed, TradeProvider } from '../../types'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { formatBalance } from '@masknet/web3-shared'

const useStyles = makeStyles()((theme) => ({
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
}))

export interface ConfirmDialogUIProps extends withClasses<never> {
    open: boolean
    trade: TradeComputed
    provider: TradeProvider
    inputToken: FungibleTokenDetailed
    outputToken: FungibleTokenDetailed
    onConfirm: () => void
    onClose?: () => void
    TradeSummaryProps?: Partial<TradeSummaryProps>
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const {
        open,
        trade,
        provider,
        inputToken,
        outputToken,
        onConfirm,
        onClose,
        TradeSummaryProps: UniswapTradeSummaryProps,
    } = props
    const { inputAmount, outputAmount, minimumReceived } = trade

    //#region detect price changing
    const [executionPrice, setExecutionPrice] = useState<BigNumber | undefined>(trade.executionPrice)
    useEffect(() => {
        if (open) setExecutionPrice(undefined)
    }, [open])
    useEffect(() => {
        if (typeof executionPrice === 'undefined') setExecutionPrice(trade.executionPrice)
    }, [trade, executionPrice])
    //#endregion

    const staled = !!(executionPrice && !executionPrice.isEqualTo(trade.executionPrice))

    return (
        <>
            <InjectedDialog open={open} onClose={onClose} title="Confirm Swap" maxWidth="xs">
                <DialogContent>
                    {inputToken && outputToken ? (
                        <>
                            <TokenPanel amount={inputAmount.toFixed() ?? '0'} token={inputToken} />
                            <ArrowDownwardIcon className={classes.reverseIcon} />
                            <TokenPanel amount={outputAmount.toFixed() ?? '0'} token={outputToken} />
                        </>
                    ) : null}
                    {staled ? (
                        <PriceStaleWarning
                            onAccept={() => {
                                setExecutionPrice(trade.executionPrice)
                            }}
                        />
                    ) : null}
                    <Typography
                        className={classes.tip}
                        color="textSecondary">{`Output is estimated. You will receive at least ${formatBalance(
                        minimumReceived,
                        outputToken.decimals,
                    )} ${outputToken.symbol ?? 'Token'} or the transaction will revert.`}</Typography>
                    <TradeSummary
                        classes={{ root: classes.summary }}
                        provider={provider}
                        trade={trade}
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
