import React from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import classNames from 'classnames'
import {
    RedPacketRecord,
    RedPacketJSONPayload,
    RedPacketStatus,
    ERC20TokenRecord,
} from '../../../database/Plugins/Wallet/types'
import Services from '../../service'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { formatBalance } from '../../../plugins/Wallet/formatter'

const useStyles = makeStyles(theme =>
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
            right: '-1em',
            width: '6em',
            height: '6em',
            bottom: '1em',
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
    const classes = useStyles()
    const { onClick, redPacket: knownRedPacket, unknownRedPacket, loading, from } = props
    const [redPacket, setRedPacket] = React.useState(knownRedPacket || ({} as Partial<RedPacketRecord>))
    const [info, setInfo] = React.useState<Partial<ERC20TokenRecord>>({})

    React.useEffect(() => {
        if (unknownRedPacket) {
            const updateRedPacket = () =>
                Services.Plugin.invokePlugin(
                    'maskbook.red_packet',
                    'discoverRedPacket',
                    unknownRedPacket,
                    from ?? '',
                ).then(packet => {
                    setRedPacket(packet)
                })
            updateRedPacket()
            return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
        }
    }, [from, unknownRedPacket])

    React.useEffect(() => {
        if (knownRedPacket) setRedPacket(knownRedPacket)
    }, [knownRedPacket])

    React.useEffect(() => {
        if (!redPacket) return
        if (!redPacket.erc20_token) setInfo({ name: 'ETH', decimals: 18 })
        else setInfo(redPacket.raw_payload?.token ?? {})
    }, [redPacket])

    const status = redPacket.status

    return (
        <Card
            elevation={0}
            className={classNames(classes.box, {
                [classes.cursor]: onClick,
            })}
            component="article"
            onClick={() => !loading && onClick?.(status, redPacket.red_packet_id)}>
            <div className={classNames(classes.header, { [classes.flex1]: status === 'incoming' })}>
                {status === 'claimed' ? (
                    <Typography variant="h5" color="inherit">
                        {redPacket.claim_amount
                            ? formatBalance(redPacket.claim_amount, info?.decimals ?? 0)
                            : 'Unknown'}{' '}
                        {info?.name ?? '(unknown)'}
                    </Typography>
                ) : (
                    <Typography variant="body1" color="inherit">
                        From: {redPacket.sender_name}
                    </Typography>
                )}
                {status !== 'incoming' && status !== 'normal' && (
                    <Typography className={classes.label} variant="body2">
                        {status === 'claim_pending' ? 'opening...' : status}
                    </Typography>
                )}
            </div>
            <div className={classNames(classes.content)}>
                <Typography className={classes.words} variant="h6">
                    {redPacket.send_message}
                </Typography>
                <Typography variant="body2">
                    {status === 'incoming'
                        ? 'Ready to open'
                        : `${
                              redPacket.send_total
                                  ? formatBalance(redPacket.send_total, info?.decimals ?? 0)
                                  : 'Unknown'
                          } ${info?.name ?? '(unknown)'} / ${redPacket.shares?.toString() ?? 'Unknown'} Shares`}
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

export function RedPacket(props: RedPacketProps) {
    const classes = useStyles()
    const { redPacket } = props
    const [info, setInfo] = React.useState<Partial<ERC20TokenRecord>>({})

    React.useEffect(() => {
        if (!redPacket) return
        if (!redPacket.erc20_token) setInfo({ name: 'ETH', decimals: 18 })
        else setInfo(redPacket.raw_payload?.token ?? {})
    }, [redPacket])

    const formatted = {
        claim_amount: '',
        send_total: redPacket?.send_total ? formatBalance(redPacket?.send_total, info?.decimals ?? 0) : 'Unknown',
        name: info.name ?? '(unknown)',
    }

    formatted.claim_amount = redPacket?.claim_amount
        ? `${formatBalance(redPacket.claim_amount, info?.decimals ?? 0)} ${formatted.name}`
        : 'Not Claimed'

    return (
        <Card elevation={0} className={classNames(classes.box)} component="article">
            <div className={classes.header}>
                <Typography variant="h5">{formatted.claim_amount}</Typography>
                <Typography className={classes.label} variant="body2">
                    {redPacket?.status}
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
