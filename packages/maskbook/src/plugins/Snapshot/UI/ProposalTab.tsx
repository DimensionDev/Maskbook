import { VotingCard } from './VotingCard'
import { SnapshotTab } from './SnapshotTab'
import { ReadMeCard } from './ReadmeCard'

export function ProposalTab() {
    return (
        <SnapshotTab>
            <ReadMeCard />
            <VotingCard />
        </SnapshotTab>
    )
}
