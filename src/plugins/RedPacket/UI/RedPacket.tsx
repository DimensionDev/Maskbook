import React, { useEffect, useCallback, useState } from 'react'
import { noop } from 'lodash-es'
import { makeStyles, createStyles, Card, Typography } from '@material-ui/core'
import classNames from 'classnames'
import type { RedPacketRecord, RedPacketJSONPayload } from '../types'
import type { RedPacketStatus } from '../types'
import Services from '../../../extension/service'
import { PluginMessageCenter } from '../../PluginMessages'
import { formatBalance } from '../../Wallet/formatter'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import BigNumber from 'bignumber.js'
import { useAvailabilityRetry } from '../hooks/useAvailability'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import { isSameAddress, isDAI, isOKB } from '../../../web3/helpers'
import { EthereumTokenType } from '../../../web3/types'

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
        flex1: {
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
        content: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
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
    state?: RedPacketStatus
    payload?: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { t } = useI18N()

    const classes = useStyles()
    const { from, payload } = props

    const account = useAccount()
    const { value: availability, loading, retry } = useAvailabilityRetry(account, payload?.rpid)

    console.log('DEBUG: red packet')
    console.log({
        ...props,
        availability,
    })

    useEffect(() => {
        if (!payload) return noop
        const updateRedPacket = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'addRedPacket', from ?? '', payload)
        updateRedPacket()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
    }, [from, JSON.stringify(payload)])

    //#region blocking
    const couldClaim = !availability?.expired && availability?.balance !== '0' && !availability?.ifclaimed
    const couldRefund =
        availability?.expired && availability.balance !== '0' && isSameAddress(payload?.sender.address ?? '', account)
    const [openTransactionDialog, setOpenTransactionDialog] = useState(false)
    const [claimState, claimCallback] = useClaimCallback(payload?.rpid, payload?.password)
    const [refundState, refundCallback] = useRefundCallback(payload?.rpid)

    const onClaimOrRefund = useCallback(async () => {
        console.log('DEUBG: claim or refund')
        console.log({
            couldClaim,
            couldRefund,
        })
        setOpenTransactionDialog(true)
        if (couldClaim) await claimCallback()
        else if (couldRefund) await refundCallback()
    }, [couldClaim, couldRefund, availability, claimCallback, refundCallback])

    const onTransactionDialogClose = useCallback(() => {
        setOpenTransactionDialog(false)
        retry()
    }, [claimState])
    //#endregion

    // TODO:
    // add loading UI
    if (!payload) return null
    if (loading || !availability) return null

    return (
        <>
            <Card
                elevation={0}
                className={classNames(classes.box, {
                    [classes.cursor]: couldClaim || couldRefund,
                })}
                component="article"
                onClick={onClaimOrRefund}>
                <div>
                    {availability.ifclaimed ? null : (
                        <Typography variant="body1" color="inherit">
                            {t('plugin_red_packet_from', { from: payload.sender.name ?? '-' })}
                        </Typography>
                    )}
                </div>
                <div className={classNames(classes.content)}>
                    <Typography className={classes.words} variant="h6">
                        {payload.sender.message}
                    </Typography>
                    <Typography variant="body2">
                        {(() => {
                            if (availability.ifclaimed) return t('plugin_red_packet_description_claimed')
                            if (
                                Number.parseInt(availability.total) > Number.parseInt(availability.claimed) &&
                                availability.balance === '0'
                            )
                                return t('plugin_red_packet_description_refunded')
                            if (availability.expired)
                                return t(
                                    couldRefund
                                        ? 'plugin_red_packet_description_refund'
                                        : 'plugin_red_packet_description_expired',
                                )
                            if (availability.balance === '0') return t('plugin_red_packet_description_empty')
                            return t('plugin_red_packet_description_failover', {
                                total: payload.total
                                    ? `${formatBalance(new BigNumber(payload.total), payload.token?.decimals ?? 18)} ${
                                          payload.token_type === EthereumTokenType.Ether
                                              ? 'ETH'
                                              : payload.token?.symbol ?? ''
                                      }`
                                    : '-',
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
                        [classes.dimmer]: !couldClaim && !couldRefund,
                    })}
                />
            </Card>

            {couldClaim || couldRefund ? (
                <TransactionDialog
                    state={couldClaim ? claimState : refundState}
                    summary={`Claiming red packet from ${payload.sender.name}`}
                    open={openTransactionDialog}
                    onClose={onTransactionDialogClose}
                />
            ) : null}
        </>
    )
}

export function RedPacketInList(props: { redPacket?: RedPacketRecord }) {
    const classes = useStyles()
    const { redPacket } = props

    const info = {
        name: 'xxx',
    }

    const formatted = {
        claim_amount: '',
        send_total: redPacket?.payload.total ? formatBalance(new BigNumber(redPacket.payload.total), 0) : 'Unknown',
        name: info.name ?? '(unknown)',
    }

    return (
        <Card elevation={0} className={classes.box} component="article">
            <div className={classes.header}>
                <Typography variant="h5">{formatted.claim_amount}</Typography>
                <Typography className={classes.label} variant="body2">
                    {'Unknown'}
                </Typography>
            </div>
            <div className={classes.content}>
                <Typography className={classes.words} variant="h6">
                    {redPacket?.payload.sender.message}
                </Typography>
                <Typography variant="body1">
                    {formatted.send_total} {formatted.name} / {redPacket?.payload.shares?.toString() ?? 'Unknown'}{' '}
                    shares
                </Typography>
            </div>
            <div className={classes.packet}></div>
        </Card>
    )
}
