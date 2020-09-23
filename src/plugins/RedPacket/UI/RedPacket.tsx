import React from 'react'
import { noop } from 'lodash-es'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import classNames from 'classnames'
import type { RedPacketRecord, RedPacketJSONPayload } from '../types'
import { RedPacketStatus } from '../types'
import Services from '../../../extension/service'
import { PluginMessageCenter } from '../../PluginMessages'
import { formatBalance } from '../../Wallet/formatter'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { isDAI, isOKB } from '../../../web3/helpers'
import { parseChainName } from '../../../web3/pipes'

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
        if (!unknownRedPacket) return noop
        const updateRedPacket = () => {
            Services.Plugin.invokePlugin('maskbook.red_packet', 'discoverRedPacket', unknownRedPacket, from ?? '').then(
                (packet) => {
                    setRedPacket(packet)
                },
            )
        }
        updateRedPacket()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
    }, [from, JSON.stringify(unknownRedPacket)])

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
    const { t } = useI18N()
    const classes = useStyles()
    const { onClick, redPacket, loading } = props
    const info = getInfo(redPacket)
    const status = redPacket?.status ?? RedPacketStatus.pending
    return (
        <Card
            elevation={0}
            className={classNames(classes.box, {
                [classes.cursor]: onClick,
            })}
            component="article"
            onClick={() => onClick?.()}>
            <div className={classNames(classes.header, { [classes.flex1]: status === 'incoming' })}>
                {status === RedPacketStatus.claimed ? (
                    <Typography variant="h5" color="inherit">
                        {redPacket?.claim_amount ? formatBalance(redPacket.claim_amount, info?.decimals ?? 0) : '?'}{' '}
                        {info?.name ?? '(unknown)'}
                    </Typography>
                ) : (
                    <Typography variant="body1" color="inherit">
                        {t('plugin_red_packet_from', { from: redPacket?.sender_name ?? '(unknown)' })}
                    </Typography>
                )}
                {status !== RedPacketStatus.incoming && status !== RedPacketStatus.normal && (
                    <Typography className={classes.label} variant="body2">
                        {status === RedPacketStatus.claim_pending
                            ? t('plugin_red_packet_user_status_opening')
                            : status ?? t('plugin_red_packet_user_status_pending')}
                    </Typography>
                )}
            </div>
            <div className={classNames(classes.content)}>
                <Typography className={classes.words} variant="h6">
                    {redPacket?.send_message}
                </Typography>
                <Typography variant="body2">
                    <Description redPacket={redPacket} />
                </Typography>
            </div>
            <div
                className={classNames(classes.packet, {
                    [classes.dai]: info.name === 'DAI' || isDAI(info.address ?? ''),
                    [classes.okb]: info.name === 'OKB' || isOKB(info.address ?? ''),
                })}></div>
            <div
                className={classNames(classes.loader, {
                    [classes.dimmer]:
                        status === RedPacketStatus.refunded ||
                        status === RedPacketStatus.expired ||
                        status === RedPacketStatus.pending ||
                        status === RedPacketStatus.claimed ||
                        loading,
                })}>
                {(loading || status === RedPacketStatus.pending) && <CircularProgress color="secondary" />}
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
        send_total: redPacket?.send_total ? formatBalance(redPacket.send_total, info?.decimals ?? 0) : 'Unknown',
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

function Description(props: { redPacket?: Partial<RedPacketRecord> }) {
    const { redPacket } = props
    const { t } = useI18N()
    const info = getInfo(redPacket)
    const getDescription = () => {
        switch (redPacket?.status) {
            case RedPacketStatus.pending:
                return t('plugin_red_packet_description_pending')
            case RedPacketStatus.incoming:
                return t('plugin_red_packet_description_incoming')
            case RedPacketStatus.fail:
                return t('plugin_red_packet_description_fail')
            case RedPacketStatus.claimed:
                return t('plugin_red_packet_description_claimed')
            case RedPacketStatus.expired:
                return t('plugin_red_packet_description_expired')
            case RedPacketStatus.claim_pending:
                return t('plugin_red_packet_description_claim_pending')
            case RedPacketStatus.empty:
                return t('plugin_red_packet_description_empty')
        }
        return t('plugin_red_packet_description_failover', {
            total: redPacket?.send_total ? formatBalance(redPacket.send_total, info?.decimals ?? 0) : '?',
            name: info?.name ?? '(unknown)',
            shares: redPacket?.shares?.toString() ?? '?',
        })
    }
    return <span>{getDescription()}</span>
}

function getInfo(
    redPacket?: Partial<RedPacketRecord>,
): { name?: string; decimals?: number; address?: string; symbol?: string } {
    if (!redPacket) return { name: undefined }
    if (!redPacket.erc20_token) return { name: 'ETH', decimals: 18 }
    else return redPacket.raw_payload?.token ?? {}
}
