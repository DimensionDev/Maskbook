import { Typography } from '@material-ui/core'
import type { ProposalIdentifier } from '../types'

export interface PostInspectorProps {
    proposalIdentifier: ProposalIdentifier
}

export function PostInspector(props: PostInspectorProps) {
    return <Typography>{props.proposalIdentifier.space}</Typography>
}
