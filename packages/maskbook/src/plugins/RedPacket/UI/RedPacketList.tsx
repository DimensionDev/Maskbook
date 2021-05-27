import { makeStyles, Typography } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { RedPacketInList } from './RedPacketInList'
import { useRedPacketsFromChain } from '../hooks/useRedPacket'
import { usePayloadsComputed } from '../hooks/usePayloadComputed'
import { useChainIdValid } from '../../../web3/hooks/useChainId'
import { useI18N } from '../../../utils'

//#region red packet list UI
const useStyles = makeStyles((theme) => ({
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
}))

interface RedPacketListProps {
    loading?: boolean
    payloads: RedPacketJSONPayload[]
    FixedSizeListProps?: Partial<FixedSizeListProps>
    onSelect?: (payload: RedPacketJSONPayload) => void
}

function RedPacketList(props: RedPacketListProps) {
    const { t } = useI18N()
    const { loading = false, payloads, FixedSizeListProps, onSelect } = props
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {loading ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    {t('plugin_dhedge_loading')}
                </Typography>
            ) : payloads.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    {t('plugin_dhedge_no_data')}
                </Typography>
            ) : (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={350}
                    overscanCount={4}
                    itemSize={60}
                    itemData={{
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
export interface RedPacketBacklogListProps extends withClasses<never> {
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketBacklogList(props: RedPacketBacklogListProps) {
    const { onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain()
    const payloads_ = usePayloadsComputed(
        'create',
        records.filter((x) => x.availability.balance !== '0' && !x.availability.expired),
    )

    // the payloads from the chain has got empty password
    const payloads = payloads_.filter((x) => x.password)
    return <RedPacketList loading={loading} payloads={payloads} onSelect={onSelect} />
}
//#endregion

//#region inbound list
export interface RedPacketInboundListProps extends withClasses<never> {
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketInboundList(props: RedPacketInboundListProps) {
    const { onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain()
    const payloads = usePayloadsComputed('claim', records)
    const chainIdValid = useChainIdValid()
    return <RedPacketList loading={loading} payloads={chainIdValid ? payloads : []} onSelect={onSelect} />
}
//#endregion

//#region outbound list
export interface RedPacketOutboundListProps extends withClasses<never> {
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketOutboundList(props: RedPacketOutboundListProps) {
    const { onSelect } = props
    const { value: records = [], loading } = useRedPacketsFromChain()
    const payloads = usePayloadsComputed('create', records)
    const chainIdValid = useChainIdValid()
    return <RedPacketList loading={loading} payloads={chainIdValid ? payloads : []} onSelect={onSelect} />
}
//#endregion
