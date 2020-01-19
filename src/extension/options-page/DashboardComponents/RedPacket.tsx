import React from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import classNames from 'classnames'
import { RedPacketRecord, RedPacketJSONPayload, RedPacketStatus } from '../../../database/Plugins/Wallet/types'
import Services from '../../service'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'

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

    React.useEffect(() => {
        if (unknownRedPacket) {
            const updateRedPacket = () =>
                Services.Plugin.invokePlugin(
                    'maskbook.red_packet',
                    'discoverRedPacket',
                    unknownRedPacket,
                    from ?? '',
                ).then(setRedPacket)
            updateRedPacket()
            return PluginMessageCenter.on('maskbook.red_packets.update', updateRedPacket)
        }
    }, [from, unknownRedPacket])

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
                        {redPacket.claim_amount?.toLocaleString()} USDT
                    </Typography>
                ) : (
                    <Typography variant="body1" color="inherit">
                        From: {redPacket.sender_name}
                    </Typography>
                )}
                {status !== 'incoming' && status !== 'normal' && (
                    <Typography className={classes.label} variant="body2">
                        {status === 'claim_pending' ? 'Opening...' : status}
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
                        : `${redPacket.send_total?.toLocaleString()} USDT / ${
                              redPacket.uuids ? redPacket.uuids.length : 'Unknown'
                          } Shares`}
                </Typography>
            </div>
            <div className={classes.packet}></div>
            <div
                className={classNames(classes.loader, {
                    [classes.dimmer]: status === 'refunded' || status === 'expired' || loading,
                })}>
                {(loading || status === 'pending') && <CircularProgress color="secondary" />}
            </div>
        </Card>
    )
}

export function RedPacket(props: RedPacketProps) {
    const classes = useStyles()
    const { redPacket: knownRedPacket, unknownRedPacket } = props
    const [redPacket, setRedPacket] = React.useState(knownRedPacket || ({} as Partial<RedPacketRecord>))

    React.useEffect(() => {
        if (unknownRedPacket)
            Services.Plugin.invokePlugin('maskbook.red_packet', 'discoverRedPacket', unknownRedPacket, '').then(
                setRedPacket,
            )
    }, [unknownRedPacket])

    return (
        <Card elevation={0} className={classNames(classes.box)} component="article">
            <div className={classes.header}>
                <Typography variant="h5">
                    {redPacket.claim_amount ? `${redPacket.claim_amount.toLocaleString()} USDT` : `Not Claimed`}
                </Typography>
                <Typography className={classes.label} variant="body2">
                    {redPacket.claim_transaction_hash ? 'Received' : 'Not Opened'}
                </Typography>
            </div>
            <div className={classes.content}>
                <Typography className={classes.words} variant="h6">
                    {redPacket.send_message}
                </Typography>
                <Typography variant="body1">
                    {redPacket.send_total?.toLocaleString()} USDT /{' '}
                    {redPacket.uuids ? redPacket.uuids.length : 'Unknown'} shares
                </Typography>
            </div>
            <div className={classes.packet}></div>
        </Card>
    )
}
