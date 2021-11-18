import { useContext } from 'react'
import { VotingCard } from './VotingCard'
import { useProposal } from './hooks/useProposal'
import { SnapshotTab } from './SnapshotTab'
import { ReadMeCard } from './ReadmeCard'
import { SnapshotContext } from '../context'

export function ProposalTab() {
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)
    return (
        <SnapshotTab>
            <ReadMeCard />
            {proposal.isEnd ? null : <VotingCard />}
        </SnapshotTab>
    )
}
