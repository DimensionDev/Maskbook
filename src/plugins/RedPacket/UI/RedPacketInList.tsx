import React from 'react'
import { createStyles, ListItem, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { resolveElapsedTime } from '../pipes'
import { useTokenComputed } from '../hooks/useTokenComputed'

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
    const { computed } = useTokenComputed(payloads[index])

    const payload = payloads[index]
    const { amount, symbol } = computed
    return (
        <ListItem button style={style} onClick={() => onClick?.(payload)}>
            <ListItemText classes={{}}>
                <Typography className={classes.primary} color="inherit" variant="body1">
                    <span className={classes.message}>{payload.sender.message}</span>
                    <span className={classes.time}>{resolveElapsedTime(payload.creation_time * 1000)}</span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" variant="body2">
                    {t('plugin_red_packet_description_failover', {
                        amount: amount ?? '-',
                        symbol,
                        name: payload.sender.name,
                        shares: payload.shares,
                    })}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
