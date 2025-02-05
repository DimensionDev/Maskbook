import { SnapshotContext } from '../context.js'
import { getProposalIdentifier } from './helpers.js'
import { Snapshot } from './Snapshot.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { unstable_useCacheRefresh } from 'react'

interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = getProposalIdentifier(props.url)

    return (
        <SnapshotContext value={identifier}>
            <SnapshotCard />
        </SnapshotContext>
    )
}
function SnapshotCard() {
    const refresh = unstable_useCacheRefresh()
    return (
        <LoadingFailCard title="" isFullPluginDown retry={refresh}>
            <Snapshot />
        </LoadingFailCard>
    )
}
