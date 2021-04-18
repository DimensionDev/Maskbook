import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid, password, seller } = props.payload

    return (
        <EthereumChainBoundary chainId={chain_id}>
            <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
                <ITO pid={pid} password={password} seller={seller} />
            </ITO_LoadingFail>
        </EthereumChainBoundary>
    )
}
