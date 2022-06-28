import {
    useAccount,
    useChainId,
    useFungibleToken,
    useCurrentWeb3NetworkPluginID,
    useFungibleTokens,
} from '@masknet/plugin-infra/web3'
import { PluginId, useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useState, useLayoutEffect, useRef, useCallback } from 'react'
import { flatten, uniq } from 'lodash-unified'
import formatDateTime from 'date-fns/format'
import { SnackbarProvider, makeStyles } from '@masknet/theme'
import { InjectedDialog, FormattedBalance, useOpenShareTxDialog } from '@masknet/shared'
import { DialogContent, CircularProgress, Typography, List, ListItem, useTheme } from '@mui/material'
import { formatBalance, NetworkPluginID, isSameAddress, FungibleToken } from '@masknet/web3-shared-base'
import { useITOConstants, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import classNames from 'classnames'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { useI18N } from '../../../utils'
import { Flags } from '../../../../shared'
import { useClaimAll } from './hooks/useClaimAll'
import { useClaimCallback } from './hooks/useClaimCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
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
            WebkitFontSmoothing: 'antialiased',
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
            height: 48,
            borderRadius: 999,
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
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList = ITO_Definition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const DialogRef = useRef<HTMLDivElement>(null)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const [chainId, setChainId] = useState(chainIdList.includes(currentChainId) ? currentChainId : ChainId.Mainnet)
    const { value: _swappedTokens, loading: _loading, retry } = useClaimAll(account, chainId)
    const { value: swappedTokensWithDetailed = [], loading: loadingTokenDetailed } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        (_swappedTokens ?? []).map((t) => t.token.address) ?? [],
        {
            chainId,
        },
    )
    const loading = _loading || loadingTokenDetailed
    const swappedTokens = _swappedTokens?.map((t) => {
        const tokenDetailed = swappedTokensWithDetailed.find((v) => isSameAddress(t.token.address, v.address))
        if (tokenDetailed) t.token = tokenDetailed as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>
        return t
    })
    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)

    const claimablePids = uniq(flatten(swappedTokens?.filter((t) => t.isClaimable).map((t) => t.pids)))

    const [{ loading: isClaiming }, claimCallback] = useClaimCallback(claimablePids, ITO2_CONTRACT_ADDRESS)
    const openShareTxDialog = useOpenShareTxDialog()
    const claim = useCallback(async () => {
        const hash = await claimCallback()
        if (typeof hash !== 'string') return
        openShareTxDialog({
            hash,
            onShare() {
                retry()
            },
        })
    }, [claimCallback, openShareTxDialog, retry])
    const { classes } = useStyles({
        shortITOwrapper: !swappedTokens || swappedTokens.length === 0,
    })
    const [initLoading, setInitLoading] = useState(true)
    useLayoutEffect(() => {
        setTimeout(() => setInitLoading(false), 1000)
    }, [])

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
                        {loading || initLoading || !swappedTokens ? (
                            <div className={classes.emptyContentWrapper}>
                                <CircularProgress size={24} />
                            </div>
                        ) : swappedTokens.length > 0 ? (
                            <div className={classes.content}>
                                <Content swappedTokens={swappedTokens} chainId={chainId} />
                            </div>
                        ) : (
                            <div className={classes.emptyContentWrapper}>
                                <Typography color="textPrimary">{t('plugin_ito_no_claimable_token')} </Typography>
                            </div>
                        )}
                        {(swappedTokens && swappedTokens.length > 0) ||
                        (chainId === ChainId.Matic && Flags.nft_airdrop_enabled) ? (
                            <div className={classes.actionButtonWrapper}>
                                <ChainBoundary
                                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                    expectedChainId={chainId}
                                    classes={{ switchButton: classes.claimAllButton }}
                                    noSwitchNetworkTip
                                    ActionButtonPromiseProps={{
                                        size: 'large',
                                        sx: {
                                            minHeight: 'auto',
                                            width: '100%',
                                            fontSize: 18,
                                            fontWeight: 400,
                                        },
                                    }}>
                                    {swappedTokens?.length ? (
                                        <WalletConnectedBoundary
                                            classes={{
                                                connectWallet: classes.claimAllButton,
                                            }}>
                                            <ActionButton
                                                className={classNames(classes.actionButton, classes.claimAllButton)}
                                                loading={isClaiming}
                                                disabled={claimablePids!.length === 0 || isClaiming}
                                                size="small"
                                                onClick={claim}>
                                                {t('plugin_ito_claim_all')}
                                            </ActionButton>
                                        </WalletConnectedBoundary>
                                    ) : (
                                        <div />
                                    )}
                                </ChainBoundary>
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
    const { value: _token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, swappedToken.token.address, {
        chainId,
    })
    const token = _token ?? swappedToken.token
    return (
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
    )
}
