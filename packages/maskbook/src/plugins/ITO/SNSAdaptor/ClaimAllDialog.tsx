import { useCallback, useEffect, useState } from 'react'
import { flatten, uniq } from 'lodash-es'
import formatDateTime from 'date-fns/format'
import { getMaskColor, useSnackbar, VariantType } from '@masknet/theme'
import { FormattedBalance, useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent, CircularProgress, Typography, List, ListItem, useTheme } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    formatBalance,
    TransactionStateType,
    resolveTransactionLinkOnExplorer,
    useITOConstants,
    ChainId,
    useChainId,
} from '@masknet/web3-shared'
import classNames from 'classnames'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useClaimablePools, SwappedToken } from './hooks/useClaimablePools'
import { WalletMessages } from '../../Wallet/messages'
import { useClaimCallback } from './hooks/useClaimCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { useLayoutEffect } from 'react'

const useStyles = makeStyles()((theme) => ({
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
        flexDirection: 'column',
        padding: 0,
        marginBottom: theme.spacing(1.5),
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    cardHeader: {
        display: 'flex',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 42,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        '-webkit-font-smoothing': 'antialiased',
        fontSize: 14,
    },
    cardHeaderLocked: {
        background: theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336',
        color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
    },
    cardHeaderClaimable: {
        background: '#77E0B5',
        color: 'white',
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        height: 62,
        fontSize: 18,
    },
    cardContentLocked: {
        background: theme.palette.mode === 'light' ? 'white' : '',
        border: `1px solid ${theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336'}`,
    },
    cardContentClaimable: {
        background: theme.palette.mode === 'light' ? 'rgba(119, 224, 181, 0.15)' : 'rgba(56, 221, 192, 0.2)',
        border: '1px solid rgba(56, 221, 192, 0.2)',
    },
    content: {
        marginBottom: theme.spacing(2),
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 300,
    },
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tabs: {
        backgroundColor: getMaskColor(theme).twitterBackground,
        width: 536,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        '& .Mui-selected': {
            backgroundColor: '#1C68F3',
            color: '#fff',
        },
        borderRadius: 4,
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    contentWrapper: {
        minHeight: 350,
        marginTop: theme.spacing(2),
    },
    emptyContentWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 350,
    },
    lockIcon: {
        width: 22,
        height: 22,
        marginRight: 6,
    },
    textWrapper: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1.5),
    },
    unlockTime: {
        marginRight: theme.spacing(1.5),
    },
    tokenBalance: {
        marginLeft: theme.spacing(1.5),
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tokenSymbol: {
        color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
    },
}))

interface ClaimAllDialogProps {
    onClose: () => void
    open: boolean
}

export function ClaimAllDialog(props: ClaimAllDialogProps) {
    const { t } = useI18N()
    const { open, onClose } = props
    const currentChainId = useChainId()
    const [chainId, setChainId] = useState(
        [ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(currentChainId) ? currentChainId : ChainId.Mainnet,
    )
    const { value: swappedTokens, loading, retry } = useClaimablePools(chainId)
    const { ITO_CONTRACT_ADDRESS: ITO_CONTRACT_ADDRESS_MAINNET } = useITOConstants(ChainId.Mainnet)
    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    // Todo: Remove the code after the period that old ITO is being used and continues to be used for a while
    const { value: swappedTokensOld, loading: loadingOld, retry: retryOld } = useClaimablePools(chainId, true)
    const { classes } = useStyles()
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
    const claimablePids = uniq(flatten(swappedTokens?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const claimablePidsOld = uniq(flatten(swappedTokensOld?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimablePids, ITO2_CONTRACT_ADDRESS)
    const [claimStateOld, claimCallbackOld, resetClaimCallbackOld] = useClaimCallback(
        claimablePidsOld,
        ITO_CONTRACT_ADDRESS_MAINNET,
    )

    const [initLoading, setInitLoading] = useState(true)
    useLayoutEffect(() => {
        setTimeout(() => setInitLoading(false), 1000)
    }, [])

    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback, chainId])

    const onClaimButtonClickOld = useCallback(() => {
        claimCallbackOld()
    }, [claimCallbackOld, chainId])

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

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: <span>ETH</span>,
                sx: { p: 0 },
                cb: () => setChainId(ChainId.Mainnet),
            },
            {
                label: <span>BSC</span>,
                sx: { p: 0 },
                cb: () => setChainId(ChainId.BSC),
            },
            {
                label: <span>Polygon/Matic</span>,
                sx: { p: 0 },
                cb: () => setChainId(ChainId.Matic),
            },
        ],
        index: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic].indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }
    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_ito_claim_all_dialog_title')}>
            <DialogContent className={classes.wrapper}>
                <AbstractTab {...tabProps} />
                <div className={classes.contentWrapper}>
                    {loading || loadingOld || initLoading || !swappedTokens || !swappedTokensOld ? (
                        <div className={classes.emptyContentWrapper}>
                            <CircularProgress size={24} />
                        </div>
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
                                        chainId={chainId}
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
                                        chainId={chainId}
                                        onClaimButtonClick={onClaimButtonClick}
                                        swappedTokens={swappedTokens}
                                        claimablePids={claimablePids}
                                    />
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className={classes.emptyContentWrapper}>
                            <Typography color="textPrimary">{t('plugin_ito_no_claimable_token')} </Typography>
                        </div>
                    )}
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}

interface ContentProps {
    chainId: ChainId
    onClaimButtonClick: () => void
    swappedTokens: SwappedToken[]
    claimablePids: string[]
}

function Content(props: ContentProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { onClaimButtonClick, swappedTokens, claimablePids, chainId } = props
    return (
        <>
            <List className={classes.tokenCardWrapper}>
                {swappedTokens.map((swappedToken, i) => (
                    <div key={i}>
                        <SwappedToken i={i} swappedToken={swappedToken} />
                    </div>
                ))}
            </List>
            <EthereumChainBoundary
                chainId={chainId}
                noSwitchNetworkTip={true}
                switchButtonStyle={{
                    backgroundColor: '#1C68F3',
                    '&:hover': {
                        backgroundColor: '#1854c4',
                    },
                    minHeight: 'auto',
                    width: '100%',
                    fontSize: 18,
                    fontWeight: 400,
                }}>
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
            </EthereumChainBoundary>
        </>
    )
}

interface SwappedTokensProps {
    i: number
    swappedToken: SwappedToken
}

function SwappedToken({ i, swappedToken }: SwappedTokensProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()

    return swappedToken.token ? (
        <ListItem key={i} className={classes.tokenCard}>
            <div
                className={classNames(
                    classes.cardHeader,
                    swappedToken.isClaimable ? classes.cardHeaderClaimable : classes.cardHeaderLocked,
                )}>
                <Typography className={classes.textWrapper}>
                    {swappedToken.isClaimable ? null : (
                        <img
                            className={classes.lockIcon}
                            src={
                                theme.palette.mode === 'light'
                                    ? new URL('../assets/lock.png', import.meta.url).toString()
                                    : new URL('../assets/lock-dark.png', import.meta.url).toString()
                            }
                        />
                    )}
                    <span>
                        {swappedToken.token.symbol}{' '}
                        {swappedToken.isClaimable
                            ? t('plugin_ito_claim_all_status_unclaimed')
                            : t('plugin_ito_claim_all_status_locked')}
                        :
                    </span>
                </Typography>
                {swappedToken.isClaimable ? null : (
                    <Typography className={classes.unlockTime}>
                        {t('plugin_ito_claim_all_unlock_time', {
                            time: formatDateTime(swappedToken.unlockTime, 'yyyy-MM-dd HH:mm:ss'),
                        })}
                    </Typography>
                )}
            </div>
            <Typography
                className={classNames(
                    classes.cardContent,
                    swappedToken.isClaimable ? classes.cardContentClaimable : classes.cardContentLocked,
                )}>
                <FormattedBalance
                    classes={{
                        balance: classes.tokenBalance,
                        symbol: classes.tokenSymbol,
                    }}
                    value={swappedToken.amount}
                    decimals={swappedToken.token.decimals}
                    symbol={swappedToken.token.symbol}
                />
            </Typography>
        </ListItem>
    ) : null
}
