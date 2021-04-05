import { SnapshotContext } from '../context'
import { useProposalIdentifier } from '../hooks/useProposalIdentifier'
import { Snapshot } from './Snapshot'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = useProposalIdentifier(props.url)
    return (
        <SnapshotContext.Provider value={identifier}>
            <Snapshot />
        </SnapshotContext.Provider>
    )
}
