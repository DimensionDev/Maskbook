import { useCallback, useEffect } from 'react'
import { makeStyles, createStyles, Card, Typography, Box } from '@material-ui/core'
import { Skeleton } from '@material-ui/core'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import type { RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { isDAI, isOKB } from '../../../web3/helpers'
import { resolveRedPacketStatus } from '../pipes'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import { formatBalance } from '../../Wallet/formatter'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { resolveChainName } from '../../../web3/pipes'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import {
    currentIsMetamaskLockedSettings,
    currentSelectedWalletProviderSettings,
} from '../../../plugins/Wallet/settings'
import { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import Services from '../../../extension/service'
import { useTokenDetailed } from '../../../web3/hooks/useTokenDetailed'
import { EthereumMessages } from '../../Ethereum/messages'
import { activatedSocialNetworkUI } from '../../../social-network'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            backgroundImage: `url(${new URL('./present-default.png', import.meta.url)})`,
        },
        dai: {
            backgroundImage: `url(${new URL('./present-dai.png', import.meta.url)})`,
        },
        okb: {
            backgroundImage: `url(${new URL('./present-okb.png', import.meta.url)})`,
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
    }),
)

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export function RedPacket(props: RedPacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    const currentSelectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    const isMetamaskRedpacketLocked =
        useValueRef(currentIsMetamaskLockedSettings) && currentSelectedWalletProvider === ProviderType.MetaMask

    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, payload)
    const { value: tokenDetailed } = useTokenDetailed(payload.token_type, payload.token?.address ?? '')
    //#ednregion

    const { canFetch, canClaim, canRefund, listOfStatus } = availabilityComputed

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            canClaim
                ? [
                      `I just claimed a red packet from @${payload.sender.name}. Follow @realMaskbook (mask.io) to claim red packets.`,
                      '#mask_io #RedPacket',
                      postLink,
                  ]
                      .filter(Boolean)
                      .join('\n')
                : '',
        )
        .toString()
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(account, payload.rpid, payload.password)
    const [refundState, refundCallback, resetRefundCallback] = useRefundCallback(account, payload.rpid)

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            resetClaimCallback()
            resetRefundCallback()
            revalidateAvailability()
        },
    )

    // open the transation dialog
    useEffect(() => {
        const state = canClaim ? claimState : refundState
        if (state.type === TransactionStateType.UNKNOWN) return
        if (!availability || !tokenDetailed) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state,
            summary: canClaim
                ? `Claiming red packet from ${payload.sender.name}`
                : canRefund
                ? `Refunding red packet for ${formatBalance(
                      new BigNumber(availability.balance),
                      tokenDetailed.decimals ?? 0,
                      tokenDetailed.decimals ?? 0,
                  )} ${tokenDetailed.symbol}`
                : '',
        })
    }, [claimState, refundState /* update tx dialog only if state changed */])
    //#endregion

    const onClaimOrRefund = useCallback(async () => {
        if (canClaim) await claimCallback()
        else if (canRefund) await refundCallback()
    }, [canClaim, canRefund, claimCallback, refundCallback])

    if (isMetamaskRedpacketLocked)
        return (
            <Card
                className={classNames(classes.root, {
                    [classes.metamaskContent]: true,
                    [classes.cursor]: true,
                })}
                onClick={() => Services.Ethereum.connectMetaMask()}
                component="article"
                elevation={0}>
                <MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />
                {t('plugin_wallet_metamask_unlock')}
            </Card>
        )

    // the red packet can fetch without account
    if (!availability || !tokenDetailed)
        return (
            <Card className={classes.root} component="article" elevation={0}>
                <Skeleton animation="wave" variant="rectangular" width={'30%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rectangular" width={'40%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width={'70%'}
                    height={12}
                    style={{ marginBottom: 16 }}
                />
            </Card>
        )

    // the chain id is not available
    if (!canFetch && payload.network) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>

    return (
        <>
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
                                    balance: formatBalance(
                                        new BigNumber(availability.balance),
                                        tokenDetailed.decimals ?? 0,
                                        tokenDetailed.decimals ?? 0,
                                    ),
                                    symbol: tokenDetailed.symbol,
                                })
                            if (listOfStatus.includes(RedPacketStatus.claimed))
                                return t('plugin_red_packet_description_claimed')
                            if (listOfStatus.includes(RedPacketStatus.refunded))
                                return t('plugin_red_packet_description_refunded')
                            if (listOfStatus.includes(RedPacketStatus.expired))
                                return t('plugin_red_packet_description_expired')
                            if (listOfStatus.includes(RedPacketStatus.empty))
                                return t('plugin_red_packet_description_empty')
                            if (!payload.password) return t('plugin_red_packet_description_broken')
                            return t('plugin_red_packet_description_failover', {
                                total: formatBalance(
                                    new BigNumber(payload.total),
                                    tokenDetailed.decimals ?? 0,
                                    tokenDetailed.decimals ?? 0,
                                ),
                                symbol: tokenDetailed.symbol,
                                name: payload.sender.name ?? '-',
                                shares: payload.shares ?? '-',
                            })
                        })()}
                    </Typography>
                </div>
                <div
                    className={classNames(classes.packet, {
                        [classes.dai]: payload.token?.name === 'DAI' || isDAI(payload.token?.address ?? ''),
                        [classes.okb]: payload.token?.name === 'OKB' || isOKB(payload.token?.address ?? ''),
                    })}
                />
                <div
                    className={classNames(classes.loader, {
                        [classes.dimmer]: !canClaim && !canRefund,
                    })}
                />
            </Card>
            {canClaim || canRefund ? (
                <Box className={classes.footer}>
                    {!account ? (
                        <ActionButton variant="contained" size="large" onClick={onConnect}>
                            {t('plugin_wallet_connect_a_wallet')}
                        </ActionButton>
                    ) : !chainIdValid ? (
                        <ActionButton disabled variant="contained" size="large">
                            {t('plugin_wallet_invalid_network')}
                        </ActionButton>
                    ) : (
                        <ActionButton variant="contained" size="large" onClick={onClaimOrRefund}>
                            {canClaim ? t('plugin_red_packet_claim') : t('plugin_red_packet_refund')}
                        </ActionButton>
                    )}
                </Box>
            ) : null}
        </>
    )
}
