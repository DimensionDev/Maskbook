import { SnapshotContext } from '../context'
import { getProposalIdentifier } from '../helpers'
import { Snapshot } from './Snapshot'
import { LoadingFailCard } from './LoadingFailCard'
import { useRetry } from '../hooks/useRetry'
import { ChainState } from '../../../web3/state/useChainState'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = getProposalIdentifier(props.url)
    const retry = useRetry()
    return (
        <ChainState.Provider>
            <SnapshotContext.Provider value={identifier}>
                <LoadingFailCard title="" isFullPluginDown={true} retry={retry}>
                    <Snapshot />
                </LoadingFailCard>
            </SnapshotContext.Provider>
        </ChainState.Provider>
    )
}
