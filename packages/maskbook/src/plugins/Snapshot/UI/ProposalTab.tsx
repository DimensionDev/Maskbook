import { useContext } from 'react'
import { VotingCard } from './VotingCard'
import { SnapshotTab } from './SnapshotTab'
import { Markdown } from './Markdown'
import { useProposal } from '../hooks/useProposal'
import { SnapshotContext } from '../context'

export function ProposalTab() {
    const identifier = useContext(SnapshotContext)
    const {
        payload: { message },
    } = useProposal(identifier.id)

    return (
        <SnapshotTab>
            <Markdown content={message.payload.body} />
            <VotingCard />
        </SnapshotTab>
    )
}
