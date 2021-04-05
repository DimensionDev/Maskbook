import { ResultCard } from './ResultCard'
import { VotesCard } from './VotesCard'
import { InformationCard } from './InformationCard'
import { SnapshotTab } from './SnapshotTab'

export interface ProgressTabProps {}

export function ProgressTab(props: ProgressTabProps) {
    return (
        <SnapshotTab>
            <InformationCard />
            <ResultCard />
            <VotesCard />
        </SnapshotTab>
    )
}
