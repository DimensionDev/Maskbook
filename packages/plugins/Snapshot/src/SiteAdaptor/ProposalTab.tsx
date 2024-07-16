import { useContext } from 'react'
import { VotingCard } from './VotingCard.js'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotTab } from './SnapshotTab.js'
import { ReadMeCard } from './ReadmeCard.js'
import { SnapshotContext } from '../context.js'

export function ProposalTab() {
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    return (
        <SnapshotTab>
            <ReadMeCard />
            {proposal.isEnd ? null : <VotingCard />}
        </SnapshotTab>
    )
}
