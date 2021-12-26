import { useContext } from 'react'
import { Markdown } from './Markdown'
import { useProposal } from './hooks/useProposal'
import { SnapshotContext } from '../context'

export interface ReadMeCardProps {}

export function ReadMeCard(props: ReadMeCardProps) {
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)

    return <Markdown content={proposal.body} />
}
