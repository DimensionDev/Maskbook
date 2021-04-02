import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'
import { ResultCard } from './ResultCard'
import { VotesCard } from './VotesCard'
import { InformationCard } from './InformationCard'
import { SnapshotTab } from './SnapshotTab'

export interface ProgressTabProps {}

export function ProgressTab(props: ProgressTabProps) {
    const snapshotState = SnapshotState.useContainer()
    if (Object.keys(snapshotState).length === 0) return null

    return (
        <SnapshotTab>
            <InformationCard />
            <ResultCard
                identifier={snapshotState.identifier!}
                message={snapshotState.message!}
                proposal={snapshotState.proposal!}
                votes={snapshotState.votes!}
            />
            <VotesCard />
        </SnapshotTab>
    )
}
