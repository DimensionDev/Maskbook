import { Skeleton } from '@material-ui/core'
import classNames from 'classnames'
import { ListItem, ListItemText, makeStyles, Theme, Typography, Box } from '@material-ui/core'
import type { RedPacketJSONPayload, History } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { formatBalance } from '@dimensiondev/maskbook-shared'
import { formatElapsed } from '../../Wallet/formatter'
import { useTokenDetailed } from '@dimensiondev/web3-shared'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { dateTimeFormat } from '../../ITO/assets/formatDate'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { StyledLinearProgress } from '../../ITO/UI/StyledLinearProgress'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme: Theme) => ({
    primary: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    secondary: {
        fontSize: 12,
    },
    message: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    time: {
        fontSize: 12,
        color: theme.palette.text.secondary,
    },
    root: {
        borderRadius: 10,
        border: `solid 1px ${theme.palette.divider}`,
        marginBottom: theme.spacing(1.5),
        position: 'static !important' as any,
        height: 'auto !important',
        padding: theme.spacing(2),
    },
    box: {
        display: 'flex',
        width: '100%',
    },
    content: {
        transform: 'translateY(-4px)',
        width: '100%',
        padding: theme.spacing(0, '1rem'),
    },
    section: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    div: {},
    icon: {
        width: 27,
        height: 27,
    },
    title: {
        fontWeight: 500,
        fontSize: 16,
    },
    info: {
        fontSize: 14,
        color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
    },
    actionButton: {
        height: 26,
        minHeight: 'auto',
    },
    footer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2),
    },
    footerInfo: {
        fontSize: 15,
        color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
        '& strong': {
            color: theme.palette.text.primary,
        },
    },
}))

export interface RedPacketInListProps {
    index: number
    style: any
    data: {
        payloads: RedPacketJSONPayload[]
        onClick?: (payload: RedPacketJSONPayload) => void
    }
}

export function RedPacketInList(props: RedPacketInListProps) {
    const { index, style, data } = props
    const { payloads, onClick } = data

    const { t } = useI18N()
    const classes = useStyles()
    const { value: token } = useTokenDetailed(payloads[index].token_type, payloads[index].token?.address ?? '')

    const payload = payloads[index]

    if (!token || !payload)
        return (
            <ListItem style={style}>
                <ListItemText>
                    <Skeleton animation="wave" variant="rectangular" width="30%" height={10} />
                    <Skeleton animation="wave" variant="rectangular" width="70%" height={10} style={{ marginTop: 8 }} />
                </ListItemText>
            </ListItem>
        )
    return (
        <ListItem button style={style} onClick={() => onClick?.(payload)}>
            <ListItemText>
                <Typography className={classes.primary} color="inherit" variant="body1">
                    <span className={classes.message}>{payload.sender.message}</span>
                    <span className={classes.time}>{formatElapsed(payload.creation_time)}</span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" variant="body2">
                    {t('plugin_red_packet_description_failover', {
                        name: payload.sender.name,
                        shares: payload.shares,
                        total: formatBalance(payload.total, token.decimals),
                        symbol: token.symbol,
                    })}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
export interface RedPacketInHistoryListProps {
    payload: History.RedPacket_InMask
}
export function RedPacketInHistoryList(props: RedPacketInHistoryListProps) {
    const { payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    return (
        <ListItem className={classes.root}>
            <Box className={classes.box}>
                <TokenIcon classes={{ icon: classes.icon }} address={payload.token.address} name={payload.token.name} />
                <Box className={classes.content}>
                    <section className={classes.section}>
                        <div className={classes.div}>
                            <Typography variant="body1" className={classNames(classes.title, classes.message)}>
                                {payload.message === '' ? t('plugin_red_packet_best_wishes') : payload.message}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_duration', {
                                    startTime: dateTimeFormat(new Date(payload.creation_time * 1000)),
                                    endTime: dateTimeFormat(
                                        new Date((payload.creation_time + payload.duration) * 1000),
                                        false,
                                    ),
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_total_amount', {
                                    amount: formatBalance(new BigNumber(payload.total), payload.token.decimals, 6),
                                    symbol: payload.token.symbol,
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_split_mode', {
                                    mode: payload.is_random
                                        ? t('plugin_red_packet_random')
                                        : t('plugin_red_packet_average'),
                                })}
                            </Typography>
                        </div>
                        <ActionButton className={classes.actionButton} variant="contained" size="large">
                            {t('plugin_red_packet_history_send')}
                        </ActionButton>
                    </section>
                    <StyledLinearProgress
                        barColor="rgba(44, 164, 239)"
                        backgroundColor="rgba(44, 164, 239, 0.2)"
                        variant="determinate"
                        value={100 * (1 - Number(payload.total_remaining) / Number(payload.total))}
                    />
                    <section className={classes.footer}>
                        <Typography
                            variant="body1"
                            className={classNames(classes.footerInfo, classes.message)}
                            dangerouslySetInnerHTML={{
                                __html: t('plugin_red_packet_history_claimed', {
                                    claimedShares: payload.claimers.length,
                                    shares: payload.shares,
                                }),
                            }}></Typography>
                        <Typography
                            variant="body1"
                            className={classNames(classes.footerInfo, classes.message)}
                            dangerouslySetInnerHTML={{
                                __html: t('plugin_red_packet_history_total_claimed_amount', {
                                    amount: formatBalance(new BigNumber(payload.total), payload.token.decimals),
                                    claimedAmount: formatBalance(
                                        new BigNumber(payload.total).minus(new BigNumber(payload.total_remaining)),
                                        payload.token.decimals,
                                    ),
                                    symbol: payload.token.symbol,
                                }),
                            }}></Typography>
                    </section>
                </Box>
            </Box>
        </ListItem>
    )
}
