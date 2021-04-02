import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'
import { ResultCard } from './ResultCard'
import { VotesCard } from './VotesCard'
import { InformationCard } from './InformationCard'
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

    return (
        <SnapshotTab>
            <InformationCard />
            <ResultCard />
            <VotesCard />
        </SnapshotTab>
    )
}
