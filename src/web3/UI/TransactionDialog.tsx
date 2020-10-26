import React from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    Typography,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Link,
} from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning'
import DoneIcon from '@material-ui/icons/Done'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useI18N } from '../../utils/i18n-next-ui'
import { useChainId } from '../hooks/useChainState'
import { TransactionState, TransactionStateType } from '../hooks/useTransactionState'
import { resolveTransactionLinkOnEtherscan } from '../pipes'
import { InjectedDialog } from '../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
    }),
)

interface TransactionDialogUIProps extends withClasses<never> {
    open: boolean
    state: TransactionState
    summary: React.ReactNode
    onClose?: () => void
}

function TransactionDialogUI(props: TransactionDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { state, summary, open, onClose } = props

    const chainId = useChainId()

    return (
        <>
            <InjectedDialog open={open} onExit={onClose} title="Transaction">
                <DialogContent>
                    {state.type === TransactionStateType.WAIT_FOR_CONFIRMING ? (
                        <>
                            <CircularProgress size={64} color="primary" />
                            <Typography className={classes.primary} color="textPrimary" variant="subtitle1">
                                Waiting For Confirmation
                            </Typography>
                            <Typography className={classes.secondary} color="textSecondary">
                                {summary}
                            </Typography>
                        </>
                    ) : null}
                    {state.type === TransactionStateType.HASH ? (
                        <>
                            <DoneIcon className={classes.icon} />
                            <Typography className={classes.primary} color="textPrimary">
                                Your transaction was submitted!
                            </Typography>
                            <Typography>
                                <Link
                                    className={classes.link}
                                    href={resolveTransactionLinkOnEtherscan(chainId, state.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    View on Etherscan
                                </Link>
                            </Typography>
                        </>
                    ) : null}
                    {state.type === TransactionStateType.CONFIRMED ? (
                        <>
                            <DoneIcon className={classes.icon} />
                            <Typography className={classes.primary} color="textPrimary">
                                Your transaction was confirmed!
                            </Typography>
                            <Typography>
                                <Link
                                    className={classes.link}
                                    href={resolveTransactionLinkOnEtherscan(chainId, state.receipt.transactionHash)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    View on Etherscan
                                </Link>
                            </Typography>
                        </>
                    ) : null}
                    {state.type === TransactionStateType.FAILED ? (
                        <>
                            <WarningIcon className={classes.icon} />
                            <Typography className={classes.primary} color="textPrimary">
                                {state.error.message.includes('User denied transaction signature.')
                                    ? 'Transaction was rejected!'
                                    : state.error.message}
                            </Typography>
                        </>
                    ) : null}
                </DialogContent>
                {state.type !== TransactionStateType.UNKNOWN &&
                state.type !== TransactionStateType.WAIT_FOR_CONFIRMING ? (
                    <DialogActions>
                        <Button color="primary" size="large" variant="contained" fullWidth onClick={onClose}>
                            {state.type === TransactionStateType.FAILED ? 'Dismiss' : 'Close'}
                        </Button>
                    </DialogActions>
                ) : null}
            </InjectedDialog>
        </>
    )
}

export interface TransactionDialogProps extends TransactionDialogUIProps {}

export function TransactionDialog(props: TransactionDialogProps) {
    return <TransactionDialogUI {...props} />
}
