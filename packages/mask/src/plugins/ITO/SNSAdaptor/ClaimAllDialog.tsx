import { usePluginIDContext, PluginId, useActivatedPlugin } from '@masknet/plugin-infra'
import { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react'
import { flatten, uniq } from 'lodash-unified'
import formatDateTime from 'date-fns/format'
import { SnackbarProvider, makeStyles } from '@masknet/theme'
import { FormattedBalance, useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent, CircularProgress, Typography, List, ListItem, useTheme } from '@mui/material'
import {
    formatBalance,
    useERC20TokenDetailed,
    TransactionStateType,
    resolveTransactionLinkOnExplorer,
    useFungibleTokensDetailed,
    EthereumTokenType,
    isSameAddress,
    useITOConstants,
    ChainId,
    useChainId,
    useAccount,
} from '@masknet/web3-shared-evm'
import classNames from 'classnames'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { useI18N } from '../../../utils'
import { Flags } from '../../../../shared'
import { useSpaceStationCampaignInfo } from './hooks/useSpaceStationCampaignInfo'
import { NftAirdropCard } from './NftAirdropCard'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useClaimAll } from './hooks/useClaimAll'
import { WalletMessages } from '../../Wallet/messages'
import { useClaimCallback } from './hooks/useClaimCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import type { SwappedTokenType } from '../types'

interface StyleProps {
    shortITOwrapper: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    const isLight = theme.palette.mode === 'light'
    return {
        wrapper: {
            padding: theme.spacing(0, 4),
            [smallQuery]: {
                padding: theme.spacing(0, 1),
            },
        },
        actionButton: {
            margin: '0 auto',
            minHeight: 'auto',
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
        tokenCardWrapper: {
            width: '100%',
            color: 'white',
            overflow: 'auto',
            paddingTop: theme.spacing(1),
            marginBottom: theme.spacing(0.5),
        },
        tokenCard: {
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
            background: isLight ? '#EBEEF0' : '#2F3336',
            color: isLight ? '#7B8192' : '#6F767C',
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
            background: isLight ? 'white' : '',
            border: `1px solid ${isLight ? '#EBEEF0' : '#2F3336'}`,
        },
        cardContentClaimable: {
            background: 'rgba(119, 224, 181, 0.1)',
            border: '1px solid rgba(56, 221, 192, 0.4)',
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
            height: 36,
            minHeight: 36,
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
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
        },
        walletStatusBox: {
            margin: theme.spacing(3, 'auto'),
        },
        claimAllButton: {
            [smallQuery]: {
                fontSize: 14,
            },
        },
    }
})

interface ClaimAllDialogProps {
    onClose: () => void
    open: boolean
}

export function ClaimAllDialog(props: ClaimAllDialogProps) {
    const { t } = useI18N()
    const { open, onClose } = props
    const ITO_Definition = useActivatedPlugin(PluginId.ITO, 'any')
    const pluginId = usePluginIDContext()
    const chainIdList = ITO_Definition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const DialogRef = useRef<HTMLDivElement>(null)
    const account = useAccount()
    const currentChainId = useChainId()
    const {
        value: campaignInfos,
        loading: loadingAirdrop,
        retry: retryAirdrop,
    } = useSpaceStationCampaignInfo(account, Flags.nft_airdrop_enabled)

    const [chainId, setChainId] = useState(chainIdList.includes(currentChainId) ? currentChainId : ChainId.Mainnet)
    const { value: _swappedTokens, loading: _loading, retry } = useClaimAll(account, chainId)
    const { value: swappedTokensWithDetailed = [], loading: loadingTokenDetailed } = useFungibleTokensDetailed(
        (_swappedTokens ?? []).map((t) => ({
            address: t.token.address,
            type: EthereumTokenType.ERC20,
        })),
        chainId,
    )
    const loading = _loading || loadingTokenDetailed
    const swappedTokens = _swappedTokens?.map((t) => {
        const tokenDetailed = swappedTokensWithDetailed.find((v) => isSameAddress(t.token.address, v.address))
        if (tokenDetailed) t.token = tokenDetailed
        return t
    })
    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)

    const claimablePids = uniq(flatten(swappedTokens?.filter((t) => t.isClaimable).map((t) => t.pids)))

    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(claimablePids, ITO2_CONTRACT_ADDRESS)
    const showNftAirdrop = chainId === ChainId.Matic && campaignInfos && Flags.nft_airdrop_enabled
    const { classes } = useStyles({
        shortITOwrapper: (showNftAirdrop && (!swappedTokens || swappedTokens.length === 0)) || !showNftAirdrop,
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

            if (claimState.type === TransactionStateType.CONFIRMED) {
                resetClaimCallback()
                retry()
            }
        },
    )

    useEffect(() => {
        resetClaimCallback()
    }, [chainId])

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return

        if (claimState.type === TransactionStateType.FAILED) {
            setClaimTransactionDialog({ open: false })
            return
        }

        if (claimState.type === TransactionStateType.HASH) {
            const { hash } = claimState
            setTimeout(() => {
                window.open(resolveTransactionLinkOnExplorer(chainId, hash), '_blank', 'noopener noreferrer')
            }, 2000)
            return
        }
        const claimableTokens = swappedTokens?.filter((t) => t.isClaimable)
        const summary = claimableTokens
            ? 'Claim ' +
              new Intl.ListFormat('en').format(
                  claimableTokens.map((t) => formatBalance(t.amount, t.token.decimals) + ' ' + t.token.symbol),
              )
            : ''
        setClaimTransactionDialog({
            open: true,
            state: claimState,
            title: t('plugin_ito_claim_all_title'),
            summary,
        })
    }, [claimState, swappedTokens /* update tx dialog only if state changed */])

    return (
        <SnackbarProvider
            domRoot={DialogRef.current as HTMLElement}
            classes={{
                variantSuccess: classes.snackbarSuccess,
                variantError: classes.snackbarError,
            }}>
            <InjectedDialog open={open} onClose={onClose} title={t('plugin_ito_claim_all_dialog_title')}>
                <DialogContent className={classes.wrapper}>
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab chainId={chainId} setChainId={setChainId} classes={classes} chains={chainIdList} />
                    </div>
                    <div className={classes.contentWrapper} ref={DialogRef}>
                        {(showNftAirdrop || loadingAirdrop) &&
                        chainId === ChainId.Matic &&
                        Flags.nft_airdrop_enabled ? (
                            <NftAirdropCard
                                campaignInfos={campaignInfos!}
                                loading={loadingAirdrop}
                                retry={retryAirdrop}
                            />
                        ) : null}

                        {loading || initLoading || !swappedTokens ? (
                            <div className={classes.emptyContentWrapper}>
                                <CircularProgress size={24} />
                            </div>
                        ) : swappedTokens.length > 0 ? (
                            <div className={classes.content}>
                                <Content swappedTokens={swappedTokens} chainId={chainId} />
                            </div>
                        ) : !showNftAirdrop && !loadingAirdrop ? (
                            <div className={classes.emptyContentWrapper}>
                                <Typography color="textPrimary">{t('plugin_ito_no_claimable_token')} </Typography>
                            </div>
                        ) : null}
                        {(swappedTokens && swappedTokens.length > 0) ||
                        (chainId === ChainId.Matic && Flags.nft_airdrop_enabled) ? (
                            <div className={classes.actionButtonWrapper}>
                                <EthereumChainBoundary
                                    chainId={chainId}
                                    classes={{ switchButton: classes.claimAllButton }}
                                    noSwitchNetworkTip
                                    disablePadding
                                    switchButtonStyle={{
                                        minHeight: 'auto',
                                        width: '100%',
                                        fontSize: 18,
                                        fontWeight: 400,
                                    }}>
                                    {swappedTokens?.length ? (
                                        <EthereumWalletConnectedBoundary
                                            classes={{
                                                connectWallet: classes.claimAllButton,
                                            }}>
                                            <ActionButton
                                                className={classNames(classes.actionButton, classes.claimAllButton)}
                                                variant="contained"
                                                loading={[
                                                    TransactionStateType.HASH,
                                                    TransactionStateType.WAIT_FOR_CONFIRMING,
                                                ].includes(claimState.type)}
                                                disabled={
                                                    claimablePids!.length === 0 ||
                                                    [
                                                        TransactionStateType.HASH,
                                                        TransactionStateType.WAIT_FOR_CONFIRMING,
                                                    ].includes(claimState.type)
                                                }
                                                size="small"
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
    swappedTokens: SwappedTokenType[]
    chainId: ChainId
}

function Content(props: ContentProps) {
    const { classes } = useStyles({ shortITOwrapper: false })
    const { swappedTokens, chainId } = props
    return (
        <List className={classes.tokenCardWrapper}>
            {swappedTokens.map((swappedToken, i) => (
                <div key={i}>
                    <SwappedToken i={i} swappedToken={swappedToken} chainId={chainId} />
                </div>
            ))}
        </List>
    )
}

interface SwappedTokensProps {
    i: number
    swappedToken: SwappedTokenType
    chainId: ChainId
}

function SwappedToken({ i, swappedToken, chainId }: SwappedTokensProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles({ shortITOwrapper: false })
    const { value: token } = useERC20TokenDetailed(swappedToken.token.address, undefined, chainId)

    return token ? (
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
                        {token.symbol}{' '}
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
                    decimals={token.decimals}
                    symbol={token.symbol}
                    formatter={formatBalance}
                />
            </Typography>
        </ListItem>
    ) : null
}
