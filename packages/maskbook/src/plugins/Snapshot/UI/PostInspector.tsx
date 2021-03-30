import { SnapshotState } from '../hooks/useSnapshotState'
import { useProposalIdentifier } from '../hooks/useProposalIdentifier'
import { Snapshot } from './Snapshot'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = useProposalIdentifier(props.url)
    if (!identifier) return null

    return (
        <SnapshotState.Provider initialState={identifier}>
            <Snapshot />
        </SnapshotState.Provider>
    )
}
