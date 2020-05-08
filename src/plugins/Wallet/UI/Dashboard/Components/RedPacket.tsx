import React from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import classNames from 'classnames'
import type { RedPacketRecord, RedPacketJSONPayload, RedPacketStatus, ERC20TokenRecord } from '../../../database/types'
import Services from '../../../../../extension/service'
import { PluginMessageCenter } from '../../../../PluginMessages'
import { formatBalance } from '../../../formatter'
import { getUrl } from '../../../../../utils/utils'
import { DAI_ADDRESS, OKB_ADDRESS } from '../../../erc20'

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
            backgroundImage: `url(${getUrl('wallet/present-default.png')})`,
            right: 0,
            width: '6em',
            height: '6em',
            position: 'absolute',
            backgroundAttachment: 'local',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
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

interface RedPacketProps {
    onClick?(state: RedPacketStatus | undefined, red_packet_id: RedPacketRecord['red_packet_id']): void
    state?: RedPacketStatus
    loading?: boolean
    redPacket?: RedPacketRecord
    unknownRedPacket?: RedPacketJSONPayload
    from?: string
}

export function RedPacketWithState(props: RedPacketProps) {
    const { onClick, redPacket: knownRedPacket, unknownRedPacket, loading, from } = props
    const [redPacket, setRedPacket] = React.useState(() => knownRedPacket || undefined)

    React.useEffect(() => {
        if (unknownRedPacket) {
            const updateRedPacket = () => {
                Services.Plugin.invokePlugin(
                    'maskbook.red_packet',
                    'discoverRedPacket',
                    unknownRedPacket,
                    from ?? '',
                ).then((packet) => {
                    setRedPacket(packet)
                })
            }
            updateRedPacket()
            return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
        } else return () => {}
    }, [from, unknownRedPacket])

    React.useEffect(() => {
        if (knownRedPacket) setRedPacket(knownRedPacket)
    }, [knownRedPacket])

    return (
        <RedPacketWithStateUI
            onClick={() => !loading && redPacket && onClick?.(redPacket.status, redPacket.red_packet_id)}
            loading={loading}
            redPacket={redPacket}
        />
    )
}

export function RedPacketWithStateUI(props: {
    onClick?(): void
    redPacket?: Partial<RedPacketRecord>
    loading?: boolean
}) {
    const classes = useStyles()
    const { onClick, redPacket, loading } = props
    const info = getInfo(redPacket)
    const status = redPacket?.status ?? 'pending'
    return (
        <Card
            elevation={0}
            className={classNames(classes.box, {
                [classes.cursor]: onClick,
            })}
            component="article"
            onClick={() => onClick?.()}>
            <div className={classNames(classes.header, { [classes.flex1]: status === 'incoming' })}>
                {status === 'claimed' ? (
                    <Typography variant="h5" color="inherit">
                        {formatBalance(redPacket?.claim_amount, info?.decimals ?? 0) ?? '?'} {info?.name ?? '(unknown)'}
                    </Typography>
                ) : (
                    <Typography variant="body1" color="inherit">
                        From: {redPacket?.sender_name ?? '(unknown)'}
                    </Typography>
                )}
                {status !== 'incoming' && status !== 'normal' && (
                    <Typography className={classes.label} variant="body2">
                        {status === 'claim_pending' ? 'opening...' : status ?? 'Pending'}
                    </Typography>
                )}
            </div>
            <div className={classNames(classes.content)}>
                <Typography className={classes.words} variant="h6">
                    {redPacket?.send_message}
                </Typography>
                <Typography variant="body2">
                    {status === 'incoming'
                        ? 'Ready to open'
                        : `${formatBalance(redPacket?.send_total, info?.decimals ?? 0) ?? '?'} ${
                              info?.name ?? '(unknown)'
                          } / ${redPacket?.shares?.toString() ?? '?'} Shares`}
                </Typography>
            </div>
            <div
                className={classNames(classes.packet, {
                    [classes.dai]: info.name === 'DAI' || info.address === DAI_ADDRESS,
                    [classes.okb]: info.name === 'OKB' || info.address === OKB_ADDRESS,
                })}></div>
            <div
                className={classNames(classes.loader, {
                    [classes.dimmer]:
                        status === 'refunded' ||
                        status === 'expired' ||
                        status === 'pending' ||
                        status === 'claimed' ||
                        loading,
                })}>
                {(loading || status === 'pending') && <CircularProgress color="secondary" />}
            </div>
        </Card>
    )
}

/**
 * A red packet card.
 * Pure component.
 */
export function RedPacket(props: { redPacket?: RedPacketRecord }) {
    const classes = useStyles()
    const { redPacket } = props

    const info = getInfo(redPacket)

    const formatted = {
        claim_amount: '',
        send_total: formatBalance(redPacket?.send_total, info?.decimals ?? 0) ?? 'Unknown',
        name: info.name ?? '(unknown)',
    }

    const amount = redPacket?.claim_amount
    formatted.claim_amount = amount ? `${formatBalance(amount, info.decimals ?? 0)} ${formatted.name}` : 'Not Claimed'

    return (
        <Card elevation={0} className={classes.box} component="article">
            <div className={classes.header}>
                <Typography variant="h5">{formatted.claim_amount}</Typography>
                <Typography className={classes.label} variant="body2">
                    {redPacket?.status ?? 'Unknown'}
                </Typography>
            </div>
            <div className={classes.content}>
                <Typography className={classes.words} variant="h6">
                    {redPacket?.send_message}
                </Typography>
                <Typography variant="body1">
                    {formatted.send_total} {formatted.name} / {redPacket?.shares?.toString() ?? 'Unknown'} shares
                </Typography>
            </div>
            <div className={classes.packet}></div>
        </Card>
    )
}

function getInfo(
    redPacket?: Partial<RedPacketRecord>,
): { name?: string; decimals?: number; address?: string; symbol?: string } {
    if (!redPacket) return { name: undefined }
    if (!redPacket.erc20_token) return { name: 'ETH', decimals: 18 }
    else return redPacket.raw_payload?.token ?? {}
}
