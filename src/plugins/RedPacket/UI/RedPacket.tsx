import React, { useEffect, useCallback, useState } from 'react'
import { noop } from 'lodash-es'
import { makeStyles, createStyles, Card, Typography } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import classNames from 'classnames'
import type { RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import Services from '../../../extension/service'
import { PluginMessageCenter } from '../../PluginMessages'
import { formatBalance } from '../../Wallet/formatter'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import BigNumber from 'bignumber.js'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import { isDAI, isOKB } from '../../../web3/helpers'
import { resolveRedPacketStatus } from '../pipes'
import { usePayloadComputed } from '../hooks/usePayloadComputed'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../../Wallet/messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        box: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
            padding: theme.spacing(2),
            background: '#DB0632',
            position: 'relative',
            display: 'flex',
            color: '#FFFFFF',
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
        from: {
            flex: '1',
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
        content: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
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
            backgroundImage: `url(${getUrl('wallet/present-default.png')})`,
        },
        dai: {
            backgroundImage: `url(${getUrl('wallet/present-dai.png')})`,
        },
        okb: {
            backgroundImage: `url(${getUrl('wallet/present-okb.png')})`,
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
    }),
)

interface RedPacketInPostProps {
    from?: string
    payload?: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { t } = useI18N()

    const classes = useStyles()
    const { from, payload } = props

    const account = useAccount()

    useEffect(() => {
        if (!payload) return noop
        const updateRedPacket = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'addRedPacket', from ?? '', payload)
        updateRedPacket()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
    }, [from, JSON.stringify(payload)])

    const { availability, computed } = usePayloadComputed(account, payload)
    const { canFetch, canClaim, canRefund, listOfStatus, tokenAmount, tokenSymbol } = computed

    //#region remote controll select provider dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )
    const onConnect = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [setOpen])
    //#endregion

    //#region blocking
    const [openTransactionDialog, setOpenTransactionDialog] = useState(false)
    const [claimState, claimCallback] = useClaimCallback(payload?.rpid, payload?.password)
    const [refundState, refundCallback] = useRefundCallback(payload?.rpid)

    const onClaimOrRefund = useCallback(async () => {
        setOpenTransactionDialog(true)
        if (canClaim) await claimCallback()
        else if (canRefund) await refundCallback()
    }, [canClaim, canRefund, claimCallback, refundCallback])

    const onTransactionDialogClose = useCallback(() => {
        setOpenTransactionDialog(false)
    }, [claimState])
    //#endregion

    // the red packet can fetch without account
    if (!payload || !availability)
        return (
            <Card className={classes.box} component="article" elevation={0}>
                <Skeleton animation="wave" variant="rect" width={'30%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rect" width={'40%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rect" width={'70%'} height={12} style={{ marginBottom: 16 }} />
            </Card>
        )

    // the red packet cannot claim or refund without account
    if (!account)
        return (
            <Card
                className={classNames(classes.box, {
                    [classes.cursor]: true,
                })}
                component="article"
                elevation={0}
                onClick={onConnect}>
                <div className={classes.header}>
                    <Typography className={classes.from} variant="body1" color="inherit">
                        {t('plugin_red_packet_from', { from: payload.sender.name ?? '-' })}
                    </Typography>
                </div>
                <div className={classNames(classes.content)}>
                    <Typography className={classes.words} variant="h6">
                        {payload.sender.message}
                    </Typography>
                    <Typography variant="body2">Click to connect a wallet.</Typography>
                </div>
            </Card>
        )

    return (
        <>
            <Card
                className={classNames(classes.box, {
                    [classes.cursor]: canClaim || canRefund,
                })}
                component="article"
                elevation={0}
                onClick={onClaimOrRefund}>
                <div className={classes.header}>
                    <Typography className={classes.from} variant="body1" color="inherit">
                        {t('plugin_red_packet_from', { from: payload.sender.name ?? '-' })}
                    </Typography>
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
                    {canFetch ? (
                        <Typography variant="body2">
                            {(() => {
                                if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
                                    return t('plugin_red_packet_description_refund', {
                                        balance: tokenAmount,
                                        symbol: tokenSymbol,
                                    })
                                if (listOfStatus.includes(RedPacketStatus.claimed))
                                    return t('plugin_red_packet_description_claimed')
                                if (listOfStatus.includes(RedPacketStatus.refunded))
                                    return t('plugin_red_packet_description_refunded')
                                if (listOfStatus.includes(RedPacketStatus.expired))
                                    return t('plugin_red_packet_description_expired')
                                if (listOfStatus.includes(RedPacketStatus.empty))
                                    return t('plugin_red_packet_description_empty')
                                return t('plugin_red_packet_description_failover', {
                                    total: payload.total ? `${tokenAmount} ${tokenSymbol}` : '-',
                                    name: payload.sender.name ?? '-',
                                    shares: payload.shares ?? '-',
                                })
                            })()}
                        </Typography>
                    ) : null}
                    {!canFetch && payload.network ? (
                        <Typography variant="body2">Only available on {payload.network} network.</Typography>
                    ) : null}
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
                <TransactionDialog
                    state={canClaim ? claimState : refundState}
                    summary={
                        canClaim
                            ? `Claiming red packet from ${payload.sender.name}`
                            : `Refunding red packet for ${tokenAmount} ${tokenSymbol}`
                    }
                    open={openTransactionDialog}
                    onClose={onTransactionDialogClose}
                />
            ) : null}
        </>
    )
}

export interface RedPacketInListProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInList(props: RedPacketInListProps) {
    const classes = useStyles()
    const { payload } = props

    const formatted = {
        claim_amount: '',
        send_total: payload.total
            ? formatBalance(new BigNumber(payload.total), payload.token?.decimals ?? 0, payload.token?.decimals ?? 0)
            : '-',
        name: payload.sender.name ?? '-',
    }

    return (
        <Card elevation={0} className={classes.box} component="article">
            <div className={classes.header}>
                <Typography variant="h5">{formatted.claim_amount}</Typography>
                {/* <Typography className={classes.label} variant="body2">
                    {'Unknown'}
                </Typography> */}
            </div>
            <div className={classes.content}>
                <Typography className={classes.words} variant="h6">
                    {payload.sender.message}
                </Typography>
                <Typography variant="body1">
                    {formatted.send_total} {formatted.name} / {payload.shares.toString() ?? '-'} shares
                </Typography>
            </div>
            <div className={classes.packet} />
        </Card>
    )
}
