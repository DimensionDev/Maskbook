import { useContext } from 'react'
import { VotingCard } from './VotingCard'
import { SnapshotTab } from './SnapshotTab'
import { Markdown } from './Markdown'
import { useProposal } from '../hooks/useProposal'
import type { ProposalMessage } from '../types'
import { SnapshotContext } from '../context'

export function ProposalTab() {
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)
    const message: ProposalMessage = JSON.parse(proposal.msg)
    return (
        <SnapshotTab>
            <Markdown content={message.payload.body} />
            <VotingCard />
        </SnapshotTab>
    )
}
