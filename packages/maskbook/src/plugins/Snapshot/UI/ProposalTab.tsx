import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshot'
import { VotingCard } from './VotingCard'
import { SnapshotTab } from './SnapshotTab'
import { Markdown } from './Markdown'

export interface ProposalTabProps {}

export function ProposalTab(props: ProposalTabProps) {
    const { value } = SnapshotState.useContainer()
    if (!value) return null

    return (
        <SnapshotTab>
            <Markdown content={value.message.payload.body} />
            <VotingCard />
        </SnapshotTab>
    )
}
