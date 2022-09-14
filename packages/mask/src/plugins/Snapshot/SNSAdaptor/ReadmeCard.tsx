import { useContext } from 'react'
import { Markdown } from '@masknet/shared'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotContext } from '../context.js'

export interface ReadMeCardProps {}

export function ReadMeCard(props: ReadMeCardProps) {
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)

    return <Markdown content={proposal.body} />
}
