import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'
import { VotingCard } from './VotingCard'
import { SnapshotTab } from './SnapshotTab'
import { Markdown } from './Markdown'

export interface ProposalTabProps {}

export function ProposalTab(props: ProposalTabProps) {
    const snapshotState = SnapshotState.useContainer()
    if (Object.keys(snapshotState).length === 0) return null

    return (
        <SnapshotTab>
            <Markdown content={snapshotState.message!.payload.body} />
            <VotingCard />
        </SnapshotTab>
    )
}
