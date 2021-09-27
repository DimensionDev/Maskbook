import {
    ChainId,
    formatBalance,
    getChainIdFromName,
    isDAI,
    isOKB,
    resolveNetworkName,
    TransactionStateType,
    useAccount,
    useChainIdValid,
    useFungibleTokenDetailed,
    useNetworkType,
    useWeb3,
    EthereumTokenType,
} from '@masknet/web3-shared'
import { Box, Card, Skeleton, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { useCallback, useEffect } from 'react'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { WalletMessages } from '../../Wallet/messages'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed'
import { useClaimCallback } from './hooks/useClaimCallback'
import { useRefundCallback } from './hooks/useRefundCallback'
import type { RedPacketAvailability, RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import { IconURLs } from './IconURL'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        background: '#DB0632',
        position: 'relative',
        display: 'flex',
        color: theme.palette.common.white,
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 136,
        boxSizing: 'border-box',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    content: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    footer: {
        paddingTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
    },
    from: {
        flex: '1',
        textAlign: 'left',
    },
    label: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.2, 1),
        background: 'rgba(0, 0, 0, 0.2)',
        textTransform: 'capitalize',
    },
    words: {
        color: '#FAF2BF',
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '85%',
    },
    button: {
        color: theme.palette.common.white,
    },
    packet: {
        top: 40,
        right: -10,
        width: 90,
        height: 90,
        position: 'absolute',
        backgroundAttachment: 'local',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${IconURLs.presentDefault})`,
    },
    dai: {
        backgroundImage: `url(${IconURLs.presentDai})`,
    },
    okb: {
        backgroundImage: `url(${IconURLs.presentOkb})`,
    },
    text: {
        padding: theme.spacing(0.5, 2),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
    },
    dimmer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    cursor: {
        cursor: 'pointer',
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    icon: {
        fontSize: 45,
    },
    metamaskContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    connectWallet: {
        marginTop: 16,
    },
}))

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export function RedPacket(props: RedPacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    // context
    const web3 = useWeb3()
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const networkType = useNetworkType()

    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, payload)
    const tokenType = payload.token ? EthereumTokenType.Native : EthereumTokenType.ERC20
    const { value: tokenDetailed } = useFungibleTokenDetailed(tokenType, payload.token?.address ?? '')

    const token = payload.token ?? tokenDetailed
    //#endregion

    const { canFetch, canClaim, canRefund, listOfStatus } = availabilityComputed

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            canClaim
                ? t(
                      isTwitter(activatedSocialNetworkUI)
                          ? 'plugin_red_packet_share_message'
                          : 'plugin_red_packet_share_message_not_twitter',
                      {
                          sender: payload.sender.name,
                          payload: postLink,
                          network: resolveNetworkName(networkType),
                      },
                  ).trim()
                : '',
        )
        .toString()

    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payload.contract_version > 3 ? web3.eth.accounts.sign(account, payload.password).signature : payload.password,
    )
    const [refundState, refundCallback, resetRefundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
    )

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => undefined,
    )

    // open the transaction dialog
    useEffect(() => {
        const state = canClaim ? claimState : refundState
        if (state.type === TransactionStateType.UNKNOWN) return
        if (!availability || !token) return
        if (state.type === TransactionStateType.HASH) {
            setTransactionDialog({
                open: true,
                shareLink: shareLink!.toString(),
                state,
                summary: canClaim
                    ? t('plugin_red_packet_claiming_from', { name: payload.sender.name })
                    : canRefund
                    ? t('plugin_red_packet_refunding_for', {
                          balance: formatBalance(availability.balance, token.decimals),
                          symbol: token.symbol,
                      })
                    : '',
            })
        } else if (state.type === TransactionStateType.CONFIRMED) {
            resetClaimCallback()
            resetRefundCallback()
            revalidateAvailability()
        }
    }, [claimState, refundState /* update tx dialog only if state changed */])
    //#endregion

    const onClaimOrRefund = useCallback(async () => {
        if (canClaim) await claimCallback()
        else if (canRefund) await refundCallback()
    }, [canClaim, canRefund, claimCallback, refundCallback])

    // the red packet can fetch without account
    if (!availability || !token)
        return (
            <EthereumChainBoundary chainId={getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet}>
                <Card className={classes.root} component="article" elevation={0}>
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="30%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="40%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="70%"
                        height={12}
                        style={{ marginBottom: 16 }}
                    />
                </Card>
            </EthereumChainBoundary>
        )

    return (
        <EthereumChainBoundary chainId={getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet}>
            <Card className={classNames(classes.root)} component="article" elevation={0}>
                <div className={classes.header}>
                    <Typography className={classes.from} variant="body1" color="inherit">
                        {t('plugin_red_packet_from', { name: payload.sender.name ?? '-' })}
                    </Typography>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {canFetch && listOfStatus.length ? (
                        <Typography className={classes.label} variant="body2">
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    ) : null}
                </div>
                <div className={classNames(classes.content)}>
                    <Typography className={classes.words} variant="h6">
                        {payload.sender.message}
                    </Typography>
                    <Typography variant="body2">
                        {(() => {
                            if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
                                return t('plugin_red_packet_description_refund', {
                                    balance: formatBalance(availability.balance, token.decimals),
                                    symbol: token.symbol,
                                })
                            if (listOfStatus.includes(RedPacketStatus.claimed))
                                return t(
                                    'plugin_red_packet_description_claimed',
                                    (availability as RedPacketAvailability).claimed_amount
                                        ? {
                                              amount: formatBalance(
                                                  (availability as RedPacketAvailability).claimed_amount,
                                                  token.decimals,
                                              ),
                                              symbol: token.symbol,
                                          }
                                        : { amount: '', symbol: '' },
                                )
                            if (listOfStatus.includes(RedPacketStatus.refunded))
                                return t('plugin_red_packet_description_refunded')
                            if (listOfStatus.includes(RedPacketStatus.expired))
                                return t('plugin_red_packet_description_expired')
                            if (listOfStatus.includes(RedPacketStatus.empty))
                                return t('plugin_red_packet_description_empty')
                            if (!payload.password) return t('plugin_red_packet_description_broken')
                            return t('plugin_red_packet_description_failover', {
                                total: formatBalance(payload.total, token.decimals),
                                symbol: token.symbol,
                                name: payload.sender.name ?? '-',
                                shares: payload.shares ?? '-',
                            })
                        })()}
                    </Typography>
                </div>
                <div
                    className={classNames(classes.packet, {
                        [classes.dai]: token?.name === 'DAI' || isDAI(token?.address ?? ''),
                        [classes.okb]: token?.name === 'OKB' || isOKB(token?.address ?? ''),
                    })}
                />
                <div
                    className={classNames(classes.loader, {
                        [classes.dimmer]: !canClaim && !canRefund,
                    })}
                />
            </Card>
            {canClaim || canRefund ? (
                <EthereumWalletConnectedBoundary
                    classes={{
                        connectWallet: classes.connectWallet,
                    }}>
                    <Box className={classes.footer}>
                        {!account ? (
                            <ActionButton variant="contained" size="large" onClick={openSelectProviderDialog}>
                                {t('plugin_wallet_connect_a_wallet')}
                            </ActionButton>
                        ) : !chainIdValid ? (
                            <ActionButton disabled variant="contained" size="large">
                                {t('plugin_wallet_invalid_network')}
                            </ActionButton>
                        ) : (
                            <ActionButton
                                disabled={
                                    claimState.type === TransactionStateType.HASH ||
                                    refundState.type === TransactionStateType.HASH
                                }
                                variant="contained"
                                size="large"
                                onClick={onClaimOrRefund}>
                                {canClaim
                                    ? claimState.type === TransactionStateType.HASH
                                        ? t('plugin_red_packet_claiming')
                                        : t('plugin_red_packet_claim')
                                    : refundState.type === TransactionStateType.HASH
                                    ? t('plugin_red_packet_refunding')
                                    : t('plugin_red_packet_refund')}
                            </ActionButton>
                        )}
                    </Box>
                </EthereumWalletConnectedBoundary>
            ) : null}
        </EthereumChainBoundary>
    )
}

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}
