import React from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    DialogTitle,
    IconButton,
    Typography,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Link,
} from '@material-ui/core'
import type { Trade } from '@uniswap/sdk'
import WarningIcon from '@material-ui/icons/Warning'
import DoneIcon from '@material-ui/icons/Done'
import type { Token } from '../../../../web3/types'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useI18N } from '../../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../../utils/shadow-root/ShadowRootDialog'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import { SwapState, SwapStateType } from '../../uniswap/useSwapCallback'
import { getActivatedUI } from '../../../../social-network/ui'
import {
    useTwitterButton,
    useTwitterCloseButton,
    useTwitterDialog,
} from '../../../../social-network-provider/twitter.com/utils/theme'
import { resolveTransactionLinkOnEtherscan } from '../../../../web3/helpers'
import { useChainId } from '../../../../web3/hooks/useChainId'
import type { TradeStrategy } from '../../types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '370px !important',
        },
        header: {
            borderBottom: 'none',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: theme.spacing(6, 2),
        },
        icon: {
            fontSize: 64,
            width: 64,
            height: 64,
        },
        link: {
            marginTop: theme.spacing(0.5),
        },
        primary: {
            fontSize: 18,
            marginTop: theme.spacing(4),
        },
        secondary: {
            fontSize: 14,
        },
        button: {
            paddingTop: 12,
            paddingBottom: 12,
        },
    }),
)

export interface TransactionDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'root'
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'title'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
    > {
    swapState: SwapState
    trade: Trade | null
    strategy: TradeStrategy
    inputToken?: Token
    outputToken?: Token
    open: boolean
    onClose?: () => void
}

export function TransactionDialogUI(props: TransactionDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { swapState, trade, strategy, inputToken, outputToken, open, onClose } = props

    const chainId = useChainId()

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={onClose}
                onExit={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    {swapState.type === SwapStateType.WAIT_FOR_CONFIRMING ? (
                        <>
                            <CircularProgress size={64} color="primary" />
                            <Typography className={classes.primary} color="textPrimary" variant="subtitle1">
                                Waiting For Confirmation
                            </Typography>
                            <Typography className={classes.secondary} color="textSecondary">
                                Swapping {trade?.inputAmount.toSignificant(6)} {trade?.inputAmount.currency.symbol} for{' '}
                                {trade?.outputAmount.toSignificant(6)} {trade?.outputAmount.currency.symbol}
                            </Typography>
                        </>
                    ) : null}
                    {swapState.type === SwapStateType.SUCCEED ? (
                        <>
                            <DoneIcon className={classes.icon} />
                            <Typography className={classes.primary} color="textPrimary">
                                Your transaction was submitted!
                            </Typography>
                            <Typography>
                                <Link
                                    className={classes.link}
                                    href={resolveTransactionLinkOnEtherscan(chainId, swapState.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    View on Etherscan
                                </Link>
                            </Typography>
                        </>
                    ) : null}
                    {swapState.type === SwapStateType.FAILED ? (
                        <>
                            <WarningIcon className={classes.icon} />
                            <Typography className={classes.primary} color="textPrimary">
                                {swapState.error.message.includes('User denied transaction signature.')
                                    ? 'Transaction was rejected!'
                                    : 'Opps, Error!'}
                            </Typography>
                        </>
                    ) : null}
                </DialogContent>
                {swapState.type !== SwapStateType.UNKNOWN && swapState.type !== SwapStateType.WAIT_FOR_CONFIRMING ? (
                    <DialogActions className={classes.actions}>
                        <Button
                            className={classes.button}
                            color="primary"
                            size="large"
                            variant="contained"
                            fullWidth
                            onClick={onClose}>
                            {swapState.type === SwapStateType.FAILED ? 'Dismiss' : 'Close'}
                        </Button>
                    </DialogActions>
                ) : null}
            </ShadowRootDialog>
        </div>
    )
}

export interface TransactionDialogProps extends TransactionDialogUIProps {}

export function TransactionDialog(props: TransactionDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
        ...useTwitterButton(),
        ...useTwitterCloseButton(),
    }

    return ui.internalName === 'twitter' ? (
        <TransactionDialogUI classes={twitterClasses} {...props} />
    ) : (
        <TransactionDialogUI {...props} />
    )
}
