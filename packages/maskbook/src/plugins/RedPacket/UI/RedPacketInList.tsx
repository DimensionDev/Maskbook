import BigNumber from 'bignumber.js'
import { Skeleton } from '@material-ui/core'
import { createStyles, ListItem, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { formatBalance, formatElapsed } from '../../Wallet/formatter'
import { useTokenDetailed } from '../../../web3/hooks/useTokenDetailed'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
    }),
)

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
                        total: formatBalance(new BigNumber(payload.total), token.decimals ?? 0, token.decimals ?? 0),
                        symbol: token.symbol,
                    })}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
