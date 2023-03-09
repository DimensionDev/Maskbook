import { SnapshotContext } from '../context.js'
import { getProposalIdentifier } from './helpers.js'
import { Snapshot } from './Snapshot.js'
import { LoadingFailCard } from './LoadingFailCard.js'
// @ts-expect-error undocumented api
import { unstable_Cache as Cache, unstable_useCacheRefresh } from 'react'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = getProposalIdentifier(props.url)

    return (
        <SnapshotContext.Provider value={identifier}>
            <Cache>
                <Component />
            </Cache>
        </SnapshotContext.Provider>
    )
}
function Component() {
    const refresh = unstable_useCacheRefresh()
    return (
        <LoadingFailCard title="" isFullPluginDown retry={refresh}>
            <Snapshot />
        </LoadingFailCard>
    )
}
