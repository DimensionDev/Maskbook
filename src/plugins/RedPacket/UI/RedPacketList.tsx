import React from 'react'
import { makeStyles, createStyles, Typography, Theme } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { RedPacketInList } from './RedPacketInList'
import { useRedPacketsFromChain } from '../hooks/useRedPacket'
import { usePayloadsComputed } from '../hooks/usePayloadComputed'

//#region red packet list UI
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            margin: '0 auto',
        },
        list: {
            width: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        placeholder: {
            textAlign: 'center',
        },
    }),
)

interface RedPacketListProps {
    from: string
    loading?: boolean
    payloads: RedPacketJSONPayload[]
    FixedSizeListProps?: Partial<FixedSizeListProps>
    onSelect?: (payload: RedPacketJSONPayload) => void
}

function RedPacketList(props: RedPacketListProps) {
    const { from, loading = false, payloads, FixedSizeListProps, onSelect } = props
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {loading ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    Loading...
                </Typography>
            ) : payloads.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    No Data
                </Typography>
            ) : (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={350}
                    overscanCount={4}
                    itemSize={60}
                    itemData={{
                        from,
                        payloads,
                        onClick: onSelect,
                    }}
                    itemCount={payloads.length}
                    {...FixedSizeListProps}>
                    {RedPacketInList}
                </FixedSizeList>
            )}
        </div>
    )
}
//#endregion

//#region backlog list
export interface RedPacketBacklogListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    from: string
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketBacklogList(props: RedPacketBacklogListProps) {
    const { from, onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain(from)
    const payloads_ = usePayloadsComputed(
        'create',
        records.filter((x) => x.availability.balance !== '0' && !x.availability.expired),
    )

    // the payloads from the chain has got empty password
    const payloads = payloads_.filter((x) => x.password)
    return <RedPacketList from={from} loading={loading} payloads={payloads} onSelect={onSelect} />
}
//#endregion

//#region inbound list
export interface RedPacketInboundListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    from: string
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketInboundList(props: RedPacketInboundListProps) {
    const { from, onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain(from)
    const payloads = usePayloadsComputed('claim', records)
    return <RedPacketList from={from} loading={loading} payloads={payloads} onSelect={onSelect} />
}
//#endregion

//#region outbound list
export interface RedPacketOutboundListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    from: string
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketOutboundList(props: RedPacketOutboundListProps) {
    const { from, onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain(from)
    const payloads = usePayloadsComputed('create', records)
    return <RedPacketList from={from} loading={loading} payloads={payloads} onSelect={onSelect} />
}
//#endregion
