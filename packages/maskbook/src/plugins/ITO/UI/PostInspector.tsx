import { ChainState } from '../../../web3/state/useChainState'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid, password, regions } = props.payload

    return (
        <ChainState.Provider>
            <EthereumChainBoundary chainId={chain_id}>
                <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
                    <ITO pid={pid} password={password} regions={regions} />
                </ITO_LoadingFail>
            </EthereumChainBoundary>
        </ChainState.Provider>
    )
}
