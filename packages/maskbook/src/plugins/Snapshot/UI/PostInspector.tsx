import { SnapshotContext } from '../context'
import { useProposalIdentifier } from '../hooks/useProposalIdentifier'
import { Snapshot } from './Snapshot'
import { NetworkFail } from './NetworkFail'
import { useRetry } from '../hooks/useRetry'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = useProposalIdentifier(props.url)
    const retry = useRetry()
    return (
        <SnapshotContext.Provider value={identifier}>
            <NetworkFail title="" isFullPluginDown={true} retry={retry}>
                <Snapshot />
            </NetworkFail>
        </SnapshotContext.Provider>
    )
}
