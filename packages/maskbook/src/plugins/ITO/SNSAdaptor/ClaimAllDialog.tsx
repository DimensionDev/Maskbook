import { useCallback, useEffect } from 'react'
import { flatten, uniq } from 'lodash-es'
import formatDateTime from 'date-fns/format'
import { useSnackbar, VariantType } from '@masknet/theme'
import { FormattedBalance, useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles, DialogContent, CircularProgress, Typography, List, ListItem } from '@material-ui/core'
import {
    formatBalance,
    TransactionStateType,
    resolveTransactionLinkOnExplorer,
    useChainId,
    useITOConstants,
    ChainId,
} from '@masknet/web3-shared'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useClaimAll, SwappedToken } from './hooks/useClaimAll'
import { WalletMessages } from '../../Wallet/messages'
import { useClaimCallback } from './hooks/useClaimCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        padding: theme.spacing(4),
    },
    actionButton: {
        margin: '0 auto',
        minHeight: 'auto',
        width: '100%',
        fontSize: 18,
        fontWeight: 400,
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
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
        overflow: 'auto',
        paddingTop: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
    },
    tokenCard: {
        width: '100%',
        color: 'white',
        height: 95,
        background: 'linear-gradient(.25turn, #0ACFFE, 40%, #2b3ef0)',
        borderRadius: 10,
        flexDirection: 'column',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2.5),
        marginBottom: theme.spacing(1.5),
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
    content: {
        marginBottom: theme.spacing(2),
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 300,
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
    const { ITO_CONTRACT_ADDRESS: ITO_CONTRACT_ADDRESS_MAINNET } = useITOConstants(ChainId.Mainnet)
    // Todo: Remove the code after the period that old ITO is being used and continues to be used for a while
    const { value: swappedTokensOld, loading: loadingOld, retry: retryOld } = useClaimAll(true)
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()
    const popEnqueueSnackbar = useCallback(
        (variant: VariantType) =>
            enqueueSnackbar(t('plugin_ito_claim_all_title'), {
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
    const claimablePidsOld = uniq(flatten(swappedTokensOld?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimablePids)
    const [claimStateOld, claimCallbackOld, resetClaimCallbackOld] = useClaimCallback(
        claimablePidsOld,
        ITO_CONTRACT_ADDRESS_MAINNET,
    )

    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])

    const onClaimButtonClickOld = useCallback(() => {
        claimCallbackOld()
    }, [claimCallbackOld])

    const { setDialog: setClaimTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            if (claimState.type === TransactionStateType.FAILED || claimStateOld.type === TransactionStateType.FAILED)
                popEnqueueSnackbar('error')

            if (claimState.type === TransactionStateType.CONFIRMED) {
                resetClaimCallback()
                retry()
                onClose()
                popEnqueueSnackbar('success')
            }

            if (claimStateOld.type === TransactionStateType.CONFIRMED) {
                resetClaimCallbackOld()
                retryOld()
                onClose()
                popEnqueueSnackbar('success')
            }
        },
    )

    useEffect(() => {
        if (claimStateOld.type === TransactionStateType.UNKNOWN) return

        if (claimStateOld.type === TransactionStateType.HASH) {
            const { hash } = claimStateOld
            setTimeout(() => {
                window.open(resolveTransactionLinkOnExplorer(chainId, hash), '_blank', 'noopener noreferrer')
            }, 2000)
            return
        }
        const claimableTokens = swappedTokensOld!.filter((t) => t.isClaimable)
        const summary =
            'Claim ' +
            new Intl.ListFormat('en').format(
                claimableTokens.map((t) => formatBalance(t.amount, t.token.decimals) + ' ' + t.token.symbol),
            )
        setClaimTransactionDialog({
            open: true,
            state: claimStateOld,
            title: t('plugin_ito_claim_all_title'),
            summary,
        })
    }, [claimStateOld, swappedTokensOld /* update tx dialog only if state changed */])

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
            title: t('plugin_ito_claim_all_title'),
            summary,
        })
    }, [claimState, swappedTokens /* update tx dialog only if state changed */])

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_ito_claim_all_dialog_title')}>
            <DialogContent className={classes.wrapper}>
                {loading || loadingOld || !swappedTokens || !swappedTokensOld ? (
                    <CircularProgress size={24} />
                ) : swappedTokens.length > 0 || swappedTokensOld.length > 0 ? (
                    <>
                        {swappedTokensOld.length > 0 ? (
                            <div className={classes.content}>
                                {swappedTokens.length > 0 && swappedTokensOld.length > 0 ? (
                                    <Typography color="textPrimary" className={classes.contentTitle}>
                                        {t('plugin_ito_claim_all_old_contract')}
                                    </Typography>
                                ) : null}
                                <Content
                                    onClaimButtonClick={onClaimButtonClickOld}
                                    swappedTokens={swappedTokensOld}
                                    claimablePids={claimablePidsOld}
                                />
                            </div>
                        ) : null}
                        {swappedTokens.length > 0 ? (
                            <div className={classes.content}>
                                {swappedTokens.length > 0 && swappedTokensOld.length > 0 ? (
                                    <Typography color="textPrimary" className={classes.contentTitle}>
                                        {t('plugin_ito_claim_all_new_contract')}
                                    </Typography>
                                ) : null}
                                <Content
                                    onClaimButtonClick={onClaimButtonClick}
                                    swappedTokens={swappedTokens}
                                    claimablePids={claimablePids}
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <Typography color="textPrimary">{t('plugin_ito_no_claimable_token')}</Typography>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}

interface ContentProps {
    onClaimButtonClick: () => void
    swappedTokens: SwappedToken[]
    claimablePids: string[]
}

function Content(props: ContentProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { onClaimButtonClick, swappedTokens, claimablePids } = props
    return (
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
                                        time: formatDateTime(swappedToken.unlockTime, 'yyyy-MM-dd HH:mm:ss'),
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
                    className={classes.actionButton}
                    variant="contained"
                    disabled={claimablePids!.length === 0}
                    size="large"
                    onClick={onClaimButtonClick}>
                    {t('plugin_ito_claim_all')}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
        </>
    )
}
