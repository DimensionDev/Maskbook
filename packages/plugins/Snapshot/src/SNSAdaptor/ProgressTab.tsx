import { ResultCard } from './ResultCard.js'
import { VotesCard } from './VotesCard.js'
import { InformationCard } from './InformationCard.js'
import { SnapshotTab } from './SnapshotTab.js'

export function ProgressTab() {
    return (
        <SnapshotTab>
            <InformationCard />
            <ResultCard />
            <VotesCard />
        </SnapshotTab>
    )
}
