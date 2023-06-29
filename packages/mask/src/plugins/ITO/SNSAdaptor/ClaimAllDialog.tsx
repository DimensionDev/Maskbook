import { useState, useLayoutEffect, useRef, useCallback } from 'react'
import { flatten, uniq } from 'lodash-es'
import formatDateTime from 'date-fns/format'
import { useChainContext, useFungibleToken, useFungibleTokens } from '@masknet/web3-hooks-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { SnackbarProvider, makeStyles, ActionButton, LoadingBase } from '@masknet/theme'
import {
    InjectedDialog,
    FormattedBalance,
    PluginWalletStatusBar,
    ChainBoundary,
    NetworkTab,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { DialogContent, Typography, List, ListItem, useTheme, DialogActions } from '@mui/material'
import { PluginID, NetworkPluginID } from '@masknet/shared-base'
import { formatBalance, isSameAddress, type FungibleToken } from '@masknet/web3-shared-base'
import { useITOConstants, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { useClaimAll } from './hooks/useClaimAll.js'
import { useClaimCallback } from './hooks/useClaimCallback.js'
import type { SwappedTokenType } from '../types.js'

interface StyleProps {
    shortITOwrapper: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    const isLight = theme.palette.mode === 'light'
    return {
        wrapper: {
            padding: 0,
            [smallQuery]: {
                padding: theme.spacing(0, 1),
            },
            overflowX: 'hidden',
        },
        actionButton: {
            margin: '0 auto',
            minHeight: 'auto',
            width: '100%',
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
        contentWrapper: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(0, 2),
        },
        actionButtonWrapper: {
            position: 'sticky',
            width: '100%',
            marginTop: 'auto',
            bottom: 0,
            zIndex: 2,
        },
        emptyContentWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 438,
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
            paddingBottom: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
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
    const ITO_Definition = useActivatedPlugin(PluginID.ITO, 'any')
    const chainIdList = ITO_Definition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
    const DialogRef = useRef<HTMLDivElement>(null)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

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
    const claim = useCallback(async () => {
        const results = await claimCallback()
        const { hash, receipt, events } = results ?? {}
        const { id } = (events?.ClaimSuccess?.returnValues ?? {}) as {
            id?: string
        }
        if (typeof hash !== 'string' || typeof receipt?.transactionHash !== 'string' || !id) return
        retry()
    }, [claimCallback, retry])
    const { classes, cx } = useStyles({
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
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab chains={chainIdList} pluginID={NetworkPluginID.PLUGIN_EVM} />
                    </div>
                    <div className={classes.contentWrapper} ref={DialogRef}>
                        {loading || initLoading || !swappedTokens ? (
                            <div className={classes.emptyContentWrapper}>
                                <LoadingBase size={24} />
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
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: 0 }}>
                    <PluginWalletStatusBar className={classes.actionButtonWrapper}>
                        <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                            {swappedTokens?.length ? (
                                <WalletConnectedBoundary expectedChainId={chainId}>
                                    <ActionButton
                                        fullWidth
                                        className={cx(classes.actionButton)}
                                        loading={isClaiming}
                                        disabled={claimablePids.length === 0}
                                        onClick={claim}>
                                        {t('plugin_ito_claim_all')}
                                    </ActionButton>
                                </WalletConnectedBoundary>
                            ) : null}
                        </ChainBoundary>
                    </PluginWalletStatusBar>
                </DialogActions>
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
    const { classes, cx } = useStyles({ shortITOwrapper: false })
    const { data: _token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, swappedToken.token.address, undefined, {
        chainId,
    })
    const token = _token ?? swappedToken.token
    return (
        <ListItem key={i} className={classes.tokenCard}>
            <div
                className={cx(
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
                className={cx(
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
