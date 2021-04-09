import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'
import { SnapshotTab } from './SnapshotTab'
import { Markdown } from './Markdown'

export interface ProposalTabProps {}

export function ProposalTab(props: ProposalTabProps) {
    const { identifier, proposal, message, votes } = SnapshotState.useContainer()
    return <SnapshotTab>
        <Markdown content={message?.payload?.body ?? ''} />
    </SnapshotTab>
}
