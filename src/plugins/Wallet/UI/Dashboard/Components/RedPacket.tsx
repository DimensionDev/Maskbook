import React from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import classNames from 'classnames'
import { RedPacketRecord, RedPacketJSONPayload, RedPacketStatus, ERC20TokenRecord } from '../../../database/types'
import Services from '../../../../../extension/service'
import { PluginMessageCenter } from '../../../../PluginMessages'
import { formatBalance } from '../../../formatter'

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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='80' viewBox='0 0 56 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.112 23.4988H63.5149C64.3482 23.4988 65.0145 24.2426 65.0248 25.1588V36.4782C65.0244 37.3951 64.3485 38.1382 63.5149 38.1382H1.50948C0.676073 38.1379 0.000455383 37.3949 0 36.4782V25.1592C0.000455383 24.2425 0.676073 23.4995 1.50948 23.4993H23.5407C17.7879 20.3617 10.3201 14.7456 11.5647 7.05925C11.6332 6.73569 12.7602 2.14331 16.1806 0.547772C18.2095 -0.411546 20.5218 -0.10932 23.0403 1.44265C23.952 2.00309 26.3823 4.39639 27.4215 6.07815C28.9891 8.60078 31.1941 12.5143 32.6153 16.632C33.9388 12.3632 36.2515 7.51168 40.2201 5.54948C41.0629 5.14016 43.8265 4.78438 45.062 5.17283C45.9923 5.46371 47.7081 6.13215 48.6685 7.2748C50.1676 9.06411 50.9028 11.059 50.8042 13.0421C50.6866 15.2198 49.6086 17.3004 47.5707 19.23C47.5117 19.284 47.4527 19.3375 47.3838 19.3811C46.8653 19.7473 44.0328 21.6773 41.112 23.4988ZM29.9986 79.1999H5.17487C4.34162 79.1994 3.66626 78.4565 3.6658 77.5399V41.447C3.66626 40.5305 4.34162 39.7875 5.17487 39.787H29.999C30.8322 39.7875 31.5076 40.5305 31.5081 41.447V77.5499C31.5081 78.4556 30.8315 79.1994 29.9986 79.1994V79.1999ZM59.8891 79.1999H35.3496C34.5164 79.1994 33.841 78.4565 33.8406 77.5399V41.447C33.841 40.5305 34.5164 39.7875 35.3496 39.787H59.8891C60.7223 39.7875 61.3977 40.5305 61.3982 41.447V77.5499C61.3982 78.4556 60.722 79.1994 59.8891 79.1994V79.1999ZM14.4851 7.77032L14.4877 7.76083C14.5396 7.56666 15.3543 4.52168 17.3469 3.5986C17.7289 3.41527 18.1505 3.32905 18.601 3.32905C19.4735 3.32905 20.4632 3.66304 21.561 4.34237C22.0507 4.64414 24.1286 6.67078 24.9223 7.96454C26.7156 10.8429 30.7338 17.8717 30.9982 23.3586C30.9112 23.2946 30.8055 23.2523 30.6994 23.2098L30.6994 23.2098L30.6946 23.2079C25.7845 21.4504 13.2896 15.2629 14.4851 7.77077V7.77032ZM43.6701 8.32005C42.9251 8.32005 41.7786 8.45982 41.4156 8.6005H41.416C36.8785 10.8422 34.7618 19.2946 34.1442 23.4985H34.3793C36.7118 22.6576 43.1998 18.3566 45.6887 16.6422C47.0216 15.3488 47.737 14.0764 47.7955 12.8584C47.8545 11.7807 47.4036 10.6594 46.4535 9.52759C46.1887 9.21493 45.3851 8.72983 44.2287 8.36316C44.1111 8.33094 43.9053 8.32005 43.6701 8.32005Z' fill='url(%23paint0_linear)'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear' x1='32.5124' y1='-39.5999' x2='-45.172' y2='24.1806' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FFFDDC'/%3E%3Cstop offset='1' stop-color='%23DAB26A'/%3E%3Cstop offset='1' stop-color='%23DAB26A'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E%0A")`,
            width: '4em',
            height: '5.7em',
            position: 'absolute',
            right: 0,
            bottom: '1em',
            backgroundAttachment: 'local',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
        },
        dai: {
            backgroundImage: `url('data:image/png;base64,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')`,
            right: '-0.5em',
            width: '6em',
            height: '6em',
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
                        {redPacket?.claim_amount ? formatBalance(redPacket?.claim_amount, info?.decimals ?? 0) : '?'}{' '}
                        {info?.name ?? '(unknown)'}
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
                        : `${redPacket?.send_total ? formatBalance(redPacket?.send_total, info?.decimals ?? 0) : '?'} ${
                              info?.name ?? '(unknown)'
                          } / ${redPacket?.shares?.toString() ?? '?'} Shares`}
                </Typography>
            </div>
            <div
                className={classNames(classes.packet, {
                    [classes.dai]: info.name === 'DAI' || info.address === '0x6B175474E89094C44Da98b954EedeAC495271d0F',
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
        send_total: redPacket?.send_total ? formatBalance(redPacket?.send_total, info?.decimals ?? 0) : 'Unknown',
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
