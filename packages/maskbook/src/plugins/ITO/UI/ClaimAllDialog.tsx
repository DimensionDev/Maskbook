import { useCallback, useEffect } from 'react'
import { uniq, flatten } from 'lodash-es'
import { useRemoteControlledDialog, useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { makeStyles, DialogContent, CircularProgress, Typography, List, ListItem } from '@material-ui/core'
import { useClaimAll } from '../hooks/useClaimAll'
import { EthereumMessages } from '../../Ethereum/messages'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { resolveTransactionLinkOnExplorer } from '../../../web3/pipes'
import { useChainId } from '../../../web3/hooks/useChainId'
import formatDateTime from 'date-fns/format'
import { formatBalance, FormattedBalance } from '@dimensiondev/maskbook-shared'
import { useSnackbar, VariantType } from 'notistack'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        padding: theme.spacing(4),
    },
    actionButton: {
        margin: '0 auto',
        minHeight: 'auto',
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
        width: '100%',
        fontSize: 18,
        fontWeight: 400,
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
    tokenCardWrapper: {
        width: '100%',
        color: 'white',
        maxHeight: 450,
        marginBottom: theme.spacing(1),
        overflow: 'auto',
        padding: theme.spacing(1, 0),
    },
    tokenCard: {
        width: '100%',
        color: 'white',
        height: 95,
        background: 'linear-gradient(.25turn, #0ACFFE, 40%, #2b3ef0)',
        marginBottom: theme.spacing(2),
        borderRadius: 10,
        flexDirection: 'column',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2.5),
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    cardHeader: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        '-webkit-font-smoothing': 'antialiased',
        fontSize: 14,
    },
    cardContent: {
        fontSize: 18,
    },
}))

interface ClaimAllDialogProps {
    onClose: () => void
    open: boolean
}

export function ClaimAllDialog(props: ClaimAllDialogProps) {
    const { t } = useI18N()
    const { open, onClose } = props
    const { value: swappedTokens, loading, retry } = useClaimAll()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()
    const popEnqueueSnackbar = useCallback(
        (variant: VariantType) =>
            enqueueSnackbar('Claim Token', {
                variant,
                preventDuplicate: true,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
            }),
        [enqueueSnackbar],
    )
    const chainId = useChainId()
    const claimablePids = uniq(flatten(swappedTokens?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimablePids)

    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])

    const { setDialog: setClaimTransactionDialog } = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (claimState.type === TransactionStateType.FAILED) popEnqueueSnackbar('error')
            if (claimState.type !== TransactionStateType.CONFIRMED) return
            resetClaimCallback()
            retry()
            onClose()
            popEnqueueSnackbar('success')
        },
    )

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return

        if (claimState.type === TransactionStateType.HASH) {
            const { hash } = claimState
            setTimeout(() => {
                window.open(resolveTransactionLinkOnExplorer(chainId, hash), '_blank', 'noopener noreferrer')
            }, 2000)
            return
        }
        const claimableTokens = swappedTokens!.filter((t) => t.isClaimable)
        const summary =
            'Claim ' +
            new Intl.ListFormat('en').format(
                claimableTokens.map((t) => formatBalance(t.amount, t.token.decimals) + ' ' + t.token.symbol),
            )
        setClaimTransactionDialog({
            open: true,
            state: claimState,
            title: 'Claim Token',
            summary,
        })
    }, [claimState, swappedTokens /* update tx dialog only if state changed */])

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_ito_claim_all_dialog_title')}>
            <DialogContent className={classes.wrapper}>
                {loading || !swappedTokens ? (
                    <CircularProgress size={24} />
                ) : swappedTokens.length > 0 ? (
                    <>
                        <List className={classes.tokenCardWrapper}>
                            {swappedTokens.map((swappedToken, i) => (
                                <ListItem key={i} className={classes.tokenCard}>
                                    <div className={classes.cardHeader}>
                                        <Typography>
                                            {swappedToken.token.symbol}{' '}
                                            {swappedToken.isClaimable
                                                ? t('plugin_ito_claim_all_status_unclaimed')
                                                : t('plugin_ito_claim_all_status_locked')}
                                            :
                                        </Typography>
                                        {swappedToken.isClaimable ? null : (
                                            <Typography>
                                                {t('plugin_ito_claim_all_unlock_time', {
                                                    time: formatDateTime(
                                                        swappedToken.unlockTime,
                                                        'yyyy-MM-dd HH:mm:ss',
                                                    ),
                                                })}
                                            </Typography>
                                        )}
                                    </div>
                                    <Typography className={classes.cardContent}>
                                        <FormattedBalance
                                            value={swappedToken.amount}
                                            decimals={swappedToken.token.decimals}
                                            symbol={swappedToken.token.symbol}
                                        />
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                        <EthereumWalletConnectedBoundary>
                            <ActionButton
                                onClick={onClaimButtonClick}
                                variant="contained"
                                disabled={claimablePids!.length === 0}
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_claim_all')}
                            </ActionButton>
                        </EthereumWalletConnectedBoundary>
                    </>
                ) : (
                    <Typography>{t('plugin_ito_no_claimable_token')}</Typography>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
