import React, { useCallback, useState } from 'react'
import { makeStyles, createStyles, Card, Typography } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import type { RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import { isDAI, isOKB } from '../../../web3/helpers'
import { resolveRedPacketStatus } from '../pipes'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../../Wallet/messages'
import { useTokenComputed } from '../hooks/useTokenComputed'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import { formatBalance } from '../../Wallet/formatter'

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

export interface RedPacketProps {
    from: string
    payload: RedPacketJSONPayload
}

export function RedPacket(props: RedPacketProps) {
    const { from, payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    const { value: availability, computed: availabilityComputed } = useAvailabilityComputed(from, payload)
    const { value: token } = useTokenComputed(payload)

    const { canFetch, canClaim, canRefund, listOfStatus } = availabilityComputed

    //#region remote controlled select provider dialog
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
    const [claimState, claimCallback] = useClaimCallback(from, payload.rpid, payload.password)
    const [refundState, refundCallback] = useRefundCallback(from, payload.rpid)

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
    if (!availability || !token)
        return (
            <Card className={classes.root} component="article" elevation={0}>
                <Skeleton animation="wave" variant="rect" width={'30%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rect" width={'40%'} height={12} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rect" width={'70%'} height={12} style={{ marginBottom: 16 }} />
            </Card>
        )

    // the red packet cannot claim or refund without account
    if (!from)
        return (
            <Card
                className={classNames(classes.root, {
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
                className={classNames(classes.root, {
                    [classes.cursor]: canClaim || canRefund,
                })}
                component="article"
                elevation={0}
                onClick={onClaimOrRefund}>
                <div className={classes.header}>
                    <Typography className={classes.from} variant="body1" color="inherit">
                        {t('plugin_red_packet_from', { name: payload.sender.name ?? '-' })}
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
                                        balance: formatBalance(
                                            new BigNumber(availability.balance),
                                            token.decimals,
                                            token.decimals,
                                        ),
                                        symbol: token.symbol,
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
                                    total: formatBalance(new BigNumber(payload.total), token.decimals, token.decimals),
                                    symbol: token.symbol,
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
                            : `Refunding red packet for ${formatBalance(
                                  new BigNumber(availability.balance),
                                  token.decimals,
                                  token.decimals,
                              )} ${token.symbol}`
                    }
                    open={openTransactionDialog}
                    onClose={onTransactionDialogClose}
                />
            ) : null}
        </>
    )
}
