import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { isCompactPayload } from '../helpers'
import { usePoolPayload } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_Error, ITO_Loading } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid } = props.payload
    const isCompactPayload_ = isCompactPayload(props.payload)

    const chainId = useChainId()
    const {
        value: payload,
        error,
        loading,
        retry,
    } = usePoolPayload(isCompactPayload_ && chainId === chain_id ? pid : '')

    const renderITO = () => {
        if (isCompactPayload_) {
            if (loading) return <ITO_Loading />
            if (error) return <ITO_Error retryPoolPayload={retry} />
        }
        return <ITO pid={pid} payload={payload ?? props.payload} />
    }
    return <EthereumChainBoundary chainId={chain_id}>{renderITO()}</EthereumChainBoundary>
}
