import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import type { JSON_PayloadInMask } from '../types'
import { ITO } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid } = props.payload

    return (
        <EthereumChainBoundary chainId={chain_id}>
            <ITO pid={pid} payload={props.payload} />
        </EthereumChainBoundary>
    )
}
