import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'
import { SnapshotTab } from './SnapshotTab'

export interface ProgressTabProps {}

export function ProgressTab(props: ProgressTabProps) {
    const { identifier, proposal, message, votes } = SnapshotState.useContainer()
    const votes_ = Object.values(votes.value ?? {})

    console.log({
        identifier,
        votes,
        proposal,
        message,
    })

    if (votes_.length === 0)
        return (
            <SnapshotTab>
                <Typography>No Data.</Typography>
            </SnapshotTab>
        )
    return (
        <SnapshotTab>
            <Typography>You have got {votes_.length} votes.</Typography>
        </SnapshotTab>
    )
}
