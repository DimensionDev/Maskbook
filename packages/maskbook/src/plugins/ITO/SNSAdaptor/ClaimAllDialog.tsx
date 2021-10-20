import { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react'
import { flatten, uniq } from 'lodash-es'
import formatDateTime from 'date-fns/format'
import { useCustomSnackbar, VariantType, SnackbarProvider } from '@masknet/theme'
import { FormattedBalance, useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent, CircularProgress, Typography, List, ListItem, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    formatBalance,
    TransactionStateType,
    resolveTransactionLinkOnExplorer,
    useITOConstants,
    ChainId,
    useChainId,
    useAccount,
} from '@masknet/web3-shared-evm'
import classNames from 'classnames'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { useSpaceStationCampaignInfo } from './hooks/useSpaceStationCampaignInfo'
import { NftAirdropCard } from './NftAirdropCard'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useClaimablePools, SwappedToken } from './hooks/useClaimablePools'
import { WalletMessages } from '../../Wallet/messages'
import { useClaimCallback } from './hooks/useClaimCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

interface StyleProps {
    shortITOwrapper: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    wrapper: {
        paddingBottom: '0px !important',
        paddingTop: '0px !important',
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
    tokenCardWrapper: {
        width: '100%',
        color: 'white',
        overflow: 'auto',
        paddingTop: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
    },
    tokenCard: {
        width: 535,
        marginLeft: 'auto',
        marginRight: 'auto',
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
    },
    tabs: {
        width: 536,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: props.shortITOwrapper ? 450 : 650,
    },
    actionButtonWrapper: {
        position: 'sticky',
        width: '100%',
        marginTop: 'auto',
        bottom: 0,
        zIndex: 2,
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
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
    snackbarSuccess: {
        backgroundColor: '#77E0B5',
    },
    snackbarError: {
        backgroundColor: '#FF5555',
    },
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
}))

interface ClaimAllDialogProps {
    onClose: () => void
    open: boolean
}

export function ClaimAllDialog(props: ClaimAllDialogProps) {
    const { t } = useI18N()
    const { open, onClose } = props
    const DialogRef = useRef<HTMLDivElement>(null)
    const account = useAccount()
    const currentChainId = useChainId()
    const { value: campaignInfos, loading: loadingAirdrop, retry: retryAirdrop } = useSpaceStationCampaignInfo(account)

    const [chainId, setChainId] = useState(
        [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai].includes(currentChainId)
            ? currentChainId
            : ChainId.Mainnet,
    )
    const { value: swappedTokens, loading, retry } = useClaimablePools(chainId)
    const { ITO_CONTRACT_ADDRESS: ITO_CONTRACT_ADDRESS_MAINNET } = useITOConstants(ChainId.Mainnet)
    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    // Todo: Remove the code after the period that old ITO is being used and continues to be used for a while
    const { value: swappedTokensOld, loading: loadingOld, retry: retryOld } = useClaimablePools(chainId, true)
    const { showSnackbar } = useCustomSnackbar()
    const popEnqueueSnackbar = useCallback(
        (variant: VariantType) =>
            showSnackbar(t('plugin_ito_claim_all_title'), {
                variant,
                preventDuplicate: true,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
            }),
        [showSnackbar],
    )
    const claimablePids = uniq(flatten(swappedTokens?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const claimablePidsOld = uniq(flatten(swappedTokensOld?.filter((t) => t.isClaimable).map((t) => t.pids)))
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimablePids, ITO2_CONTRACT_ADDRESS)
    const [claimStateOld, resetClaimCallbackOld] = useClaimCallback(claimablePidsOld, ITO_CONTRACT_ADDRESS_MAINNET)

    const showNftAirdrop = chainId === ChainId.Matic && campaignInfos
    const { classes } = useStyles({
        shortITOwrapper:
            (showNftAirdrop &&
                (!swappedTokens || swappedTokens.length === 0) &&
                (!swappedTokensOld || swappedTokensOld.length === 0)) ||
            !showNftAirdrop,
    })
    const [initLoading, setInitLoading] = useState(true)
    useLayoutEffect(() => {
        setTimeout(() => setInitLoading(false), 1000)
    }, [])

    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback, chainId])

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

    const createTabItem = (name: string, chainId: ChainId) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: [
            createTabItem('ETH', ChainId.Mainnet),
            createTabItem('BSC', ChainId.BSC),
            createTabItem('Polygon/Matic', ChainId.Matic),
            createTabItem('Arbitrum', ChainId.Arbitrum),
            createTabItem('xDai', ChainId.xDai),
        ],
        index: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai].indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }
    return (
        <SnackbarProvider
            domRoot={DialogRef.current as HTMLElement}
            classes={{
                variantSuccess: classes.snackbarSuccess,
                variantError: classes.snackbarError,
            }}>
            <InjectedDialog open={open} onClose={onClose} title={t('plugin_ito_claim_all_dialog_title')}>
                <DialogContent className={classes.wrapper}>
                    <div className={classes.abstractTabWrapper}>
                        <AbstractTab {...tabProps} />
                    </div>
                    <div className={classes.contentWrapper} ref={DialogRef}>
                        {(showNftAirdrop || loadingAirdrop) && chainId === ChainId.Matic ? (
                            <NftAirdropCard
                                campaignInfos={campaignInfos!}
                                loading={loadingAirdrop}
                                retry={retryAirdrop}
                            />
                        ) : null}

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
                                        <Content swappedTokens={swappedTokensOld} />
                                    </div>
                                ) : null}
                                {swappedTokens.length > 0 ? (
                                    <div className={classes.content}>
                                        {swappedTokens.length > 0 && swappedTokensOld.length > 0 ? (
                                            <Typography color="textPrimary" className={classes.contentTitle}>
                                                {t('plugin_ito_claim_all_new_contract')}
                                            </Typography>
                                        ) : null}
                                        <Content swappedTokens={swappedTokens} />
                                    </div>
                                ) : null}
                            </>
                        ) : !showNftAirdrop && !loadingAirdrop && chainId !== ChainId.Matic ? (
                            <div className={classes.emptyContentWrapper}>
                                <Typography color="textPrimary">{t('plugin_ito_no_claimable_token')} </Typography>
                            </div>
                        ) : null}
                        {(swappedTokens && swappedTokens.length > 0) ||
                        (swappedTokensOld && swappedTokensOld.length > 0) ||
                        chainId === ChainId.Matic ? (
                            <div className={classes.actionButtonWrapper}>
                                <EthereumChainBoundary
                                    chainId={chainId}
                                    noSwitchNetworkTip={true}
                                    switchButtonStyle={{
                                        minHeight: 'auto',
                                        width: 540,
                                        fontSize: 18,
                                        fontWeight: 400,
                                    }}>
                                    {swappedTokens?.length || swappedTokensOld?.length ? (
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
                                    ) : (
                                        <div />
                                    )}
                                </EthereumChainBoundary>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </InjectedDialog>
        </SnackbarProvider>
    )
}

interface ContentProps {
    swappedTokens: SwappedToken[]
}

function Content(props: ContentProps) {
    const { classes } = useStyles({ shortITOwrapper: false })
    const { swappedTokens } = props
    return (
        <List className={classes.tokenCardWrapper}>
            {swappedTokens.map((swappedToken, i) => (
                <div key={i}>
                    <SwappedToken i={i} swappedToken={swappedToken} />
                </div>
            ))}
        </List>
    )
}

interface SwappedTokensProps {
    i: number
    swappedToken: SwappedToken
}

function SwappedToken({ i, swappedToken }: SwappedTokensProps) {
    const { t } = useI18N()
    const { classes } = useStyles({ shortITOwrapper: false })
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
