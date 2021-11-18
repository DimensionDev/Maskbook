import { ResultCard } from './ResultCard'
import { VotesCard } from './VotesCard'
import { InformationCard } from './InformationCard'
import { SnapshotTab } from './SnapshotTab'

export function ProgressTab() {
    return (
        <SnapshotTab>
            <InformationCard />
            <ResultCard />
            <VotesCard />
        </SnapshotTab>
    )
}
