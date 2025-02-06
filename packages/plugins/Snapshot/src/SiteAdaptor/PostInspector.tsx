import { unstable_useCacheRefresh, useMemo } from 'react'
import { SnapshotContext } from '../context.js'
import { getProposalIdentifier } from './helpers.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { Snapshot } from './Snapshot.js'

interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = useMemo(() => getProposalIdentifier(props.url), [props.url])

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
