import { SnapshotContext } from '../context.js'
import { getProposalIdentifier } from './helpers.js'
import { Snapshot } from './Snapshot.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { useRetry } from './hooks/useRetry.js'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = getProposalIdentifier(props.url)
    const retry = useRetry()

    return (
        <SnapshotContext.Provider value={identifier}>
            <LoadingFailCard title="" isFullPluginDown retry={retry}>
                <Snapshot />
            </LoadingFailCard>
        </SnapshotContext.Provider>
    )
}
