import React from 'react'
import { makeStyles, createStyles, Box } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { useOutboundRedPackets } from '../hooks/useOutboundRedPackets'
import { RedPacketInList } from './RedPacket'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            height: '100%',
            flexDirection: 'column',
            margin: '0 auto',
        },
        scroller: {
            width: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            margin: 'auto',
            cursor: 'pointer',
        },
    }),
)

export interface RedPacketOutboundListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    from: string
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketOutboundList(props: RedPacketOutboundListProps) {
    const { from } = props
    const classes = useStyles()

    const { value: redPackets = [], loading } = useOutboundRedPackets(from)

    console.log('DEBUG: red packet outbound list')
    console.log(redPackets)

    return (
        <div className={classes.wrapper}>
            <div className={classes.scroller}>
                {redPackets.map((x) => (
                    <RedPacketInList key={x.rpid} payload={x} />
                ))}
            </div>
        </div>
    )
}
