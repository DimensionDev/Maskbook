import { useCallback, useEffect } from 'react'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import {
    makeStyles,
    createStyles,
    DialogContent,
    CircularProgress,
    Paper,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Table,
    Typography,
    Link,
} from '@material-ui/core'
import { useClaimAll } from '../hooks/useClaimAll'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumMessages } from '../../Ethereum/messages'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { resolveTransactionLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId } from '../../../web3/hooks/useChainId'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            padding: theme.spacing(4, 4, 2, 4),
        },
        table: {
            paddingBottom: theme.spacing(1),
            borderRadius: 0,
            marginBottom: 16,
        },
        head: {
            border: '1px solid rgba(224, 224, 224, 1)',
            color: theme.palette.text.secondary,
            width: '50%',
        },
        cell: {
            border: '1px solid rgba(224, 224, 224, 1)',
            color: theme.palette.text.primary,
            wordBreak: 'break-word',
            width: '50%',
        },
        actionButton: {
            margin: '0 auto',
            minHeight: 'auto',
            width: '50%',
        },
        footer: {
            marginTop: theme.spacing(2),
            zIndex: 1,
        },
        footnote: {
            fontSize: 10,
            marginRight: theme.spacing(1),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        maskbook: {
            width: 40,
            height: 10,
        },
    }),
)

interface ClaimAllDialogProps {
    onClose: () => void
    open: boolean
}

export function ClaimAllDialog(props: ClaimAllDialogProps) {
    const { t } = useI18N()
    const { open, onClose } = props
    const { value: claimableAll, loading, retry } = useClaimAll()
    const classes = useStyles()
    const chainId = useChainId()

    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimableAll?.pids ?? [])

    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])

    const [_open, setClaimTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (claimState.type !== TransactionStateType.CONFIRMED) return
            resetClaimCallback()
            retry()
            onClose()
        },
    )

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return

        if (claimState.type === TransactionStateType.HASH) {
            const { hash } = claimState
            setTimeout(() => {
                window.open(resolveTransactionLinkOnEtherscan(chainId, hash), '_blank', 'noopener noreferrer')
            }, 2000)
            return
        }

        setClaimTransactionDialogOpen({
            open: true,
            state: claimState,
            summary: 'Claiming all tokens.',
        })
    }, [claimState /* update tx dialog only if state changed */])

    return (
        <InjectedDialog open={open} onClose={onClose} title="ITO Claim all tokens">
            <DialogContent className={classes.wrapper}>
                {loading || !claimableAll ? (
                    <CircularProgress size={24} />
                ) : claimableAll.pids.length > 0 ? (
                    <>
                        <TableContainer component={Paper} className={classes.table}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_claimable_token')}
                                        </TableCell>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_claimable_total_amount')}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.values(claimableAll?.tokens!).map((t, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className={classes.cell} align="center" size="small">
                                                    {t.token.symbol}
                                                </TableCell>
                                                <TableCell
                                                    className={classes.cell}
                                                    align="center"
                                                    size="small"
                                                    style={{ whiteSpace: 'nowrap' }}>
                                                    {formatBalance(t.amount, t.token.decimals)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <EthereumWalletConnectedBoundary>
                            <ActionButton
                                onClick={onClaimButtonClick}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_claim')}
                            </ActionButton>
                        </EthereumWalletConnectedBoundary>
                    </>
                ) : (
                    <Typography>{t('plugin_ito_no_claimable_token')}</Typography>
                )}
                <div className={classes.footer}>
                    <Typography className={classes.footnote} variant="subtitle2">
                        <span>Powered by </span>
                        <Link
                            className={classes.footLink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mask"
                            href="https://mask.io">
                            <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                        </Link>
                    </Typography>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
