import { useContext } from 'react'
import { Markdown } from './Markdown'
import { useProposal } from './hooks/useProposal'
import { SnapshotContext } from '../context'

export interface ReadMeCardProps {}

export function ReadMeCard(props: ReadMeCardProps) {
    const identifier = useContext(SnapshotContext)
    const {
        payload: { message },
    } = useProposal(identifier.id)

    return <Markdown content={message.payload.body} />
}
